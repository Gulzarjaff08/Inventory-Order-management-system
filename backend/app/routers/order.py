from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate, OrderOut, OrderItemOut

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


def build_order_response(order: Order) -> OrderOut:
    """Helper: convert ORM order object into the OrderOut response shape."""
    items_out = []
    for item in order.items:
        items_out.append(OrderItemOut(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product.name,
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=item.subtotal
        ))

    return OrderOut(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name,
        total_amount=order.total_amount,
        items=items_out,
        created_at=order.created_at,
        updated_at=order.updated_at
    )


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    # verify customer exists before creating transaction
    customer = db.query(Customer).filter(Customer.id == order_in.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {order_in.customer_id} not found."
        )

    # ensure we have enough stock for each product in payload
    resolved_items = []
    for item_in in order_in.items:
        product = db.query(Product).filter(Product.id == item_in.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item_in.product_id} not found."
            )
        if product.quantity < item_in.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}, Requested: {item_in.quantity}."
            )
        resolved_items.append({
            "product": product,
            "quantity": item_in.quantity,
            "unit_price": product.price,
            "subtotal": round(product.price * item_in.quantity, 2)
        })

    # calculate total order price
    total_amount = round(sum(i["subtotal"] for i in resolved_items), 2)

    # insert root order record first
    db_order = Order(
        customer_id=order_in.customer_id,
        total_amount=total_amount
    )
    db.add(db_order)
    db.flush()  # flush to get the order ID before adding items

    # insert line items and decrement inventory
    for item_data in resolved_items:
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            subtotal=item_data["subtotal"]
        )
        db.add(db_item)
        # Automatically deduct quantity from stock
        item_data["product"].quantity -= item_data["quantity"]

    db.commit()
    db.refresh(db_order)
    return build_order_response(db_order)


@router.get("", response_model=List[OrderOut])
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(Order)\
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))\
        .order_by(Order.id.desc())\
        .all()
    return [build_order_response(o) for o in orders]


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order)\
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))\
        .filter(Order.id == order_id)\
        .first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return build_order_response(order)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order)\
        .options(joinedload(Order.items).joinedload(OrderItem.product))\
        .filter(Order.id == order_id)\
        .first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Restore stock for each item when cancelling the order
    for item in order.items:
        item.product.quantity += item.quantity

    db.delete(order)
    db.commit()
    return None
