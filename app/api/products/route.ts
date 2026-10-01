import { productService } from '../../../services/productService.ts';

/**
 * Next.js App Router Route Handler: GET /api/products
 * Exposes product query operations via RESTful API.
 */
export async function GET(request?: Request): Promise<Response> {
  try {
    const url = request ? new URL(request.url) : null;
    const category = url?.searchParams.get('category');

    const products = category
      ? await productService.getProductsByCategory(category)
      : await productService.getAllProducts();

    return Response.json(products, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Error al obtener los productos' },
      { status: 500 }
    );
  }
}
