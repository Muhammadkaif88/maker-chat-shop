-- Staff can view, insert, update, delete products
CREATE POLICY "Staff can view products" 
ON public.products 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can insert products" 
ON public.products 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can update products" 
ON public.products 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can delete products" 
ON public.products 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

-- Staff can view, insert, update, delete categories
CREATE POLICY "Staff can view categories" 
ON public.categories 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can insert categories" 
ON public.categories 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can update categories" 
ON public.categories 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can delete categories" 
ON public.categories 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

-- Staff can view, insert, update, delete courses
CREATE POLICY "Staff can view courses" 
ON public.courses 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can insert courses" 
ON public.courses 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can update courses" 
ON public.courses 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can delete courses" 
ON public.courses 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

-- Staff can view and update orders
CREATE POLICY "Staff can view all orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can update orders" 
ON public.orders 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

-- Staff can view user roles
CREATE POLICY "Staff can view all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

-- Admin can manage user_roles
CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));