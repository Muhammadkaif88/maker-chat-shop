-- Drop the old restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Create new INSERT policy that allows both authenticated and anonymous users
CREATE POLICY "Customers can create orders"
ON orders FOR INSERT
TO public, authenticated
WITH CHECK (true);

-- Drop and recreate the SELECT policy to handle both user types
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
TO public, authenticated
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) 
  OR (auth.uid() IS NULL AND user_id IS NULL)
  OR (user_id IS NULL)
);