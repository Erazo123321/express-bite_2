export interface CreateOrderItemDTO {
  productId: string;
  quantity: number;
}

export interface CreateOrderDTO {
  customerName: string;
  items: CreateOrderItemDTO[];
  paymentMethod?: string;
}
