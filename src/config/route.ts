const ROUTES = {
  // SignUp routes
  DASHBOARD: '/home',
  ORDERS: '/orders',

  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: number) => `/products/${id}`,
  ADD_PRODUCT: '/products/add',
  EDIT_PRODUCT: (id: number) => `/products/${id}/edit`,

  CATEGORIES: '/categories',

  USERS: '/users',

  LOGIN: '/login',

  NOT_FOUND: 'not-found',

  HOME: '/',
};

export default ROUTES;
