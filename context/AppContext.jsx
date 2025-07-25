'use client'
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { err } from "inngest/types";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()
    const { user } = useUser();
    const { getToken } = useAuth();

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const [isUpdatingCart, setIsUpdatingCart] = useState(false)
    const cartUpdateTimeoutRef = useRef(null)

    const fetchProductData = async () => {
        try {

            const { data } = await axios.get('/api/product/list');
            if (data.success) {
                setProducts(data.products);
            } else {
                toast.error(data.message || 'Failed to fetch products');
            }
            
        } catch (error) {
           
            toast.error(error.message || 'Failed to fetch products');
        }
    }

    const fetchUserData = async () => {
        try {
            // Check if user exists and has publicMetadata before accessing isSeller
            if (user.publicMetadata.role === 'seller') {
                setIsSeller(true);
            }

            const token = await getToken();
            const {data} = await axios.get('/api/user/data', { headers: { Authorization: `Bearer ${token}` }});
          
            if (data.success) {
                setUserData(data.user);
                setCartItems(data.user.cartItems || {});
            } else {
                // If user not found, it means they haven't been synced to DB yet
                // This is normal for new users - just use default values
                console.log('User not found in database, using default values');
                setCartItems({});
            }
                    
        } catch (error) {
            console.error('Error fetching user data:', error);
            // Don't show error toast for new users who aren't in DB yet
            if (!error.response?.data?.message?.includes('User not found')) {
                toast.error(error.message || 'Failed to fetch user data');
            }
            // Set default values on error
            setCartItems({});
        }
    }

    const debouncedCartUpdate = useCallback(async (cartData) => {
        if (!user) return;
        
        try {
            setIsUpdatingCart(true);
            const token = await getToken();
            await axios.post('/api/cart/update', cartData, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
        } catch (error) {
            toast.error('Failed to update cart');
            console.error('Cart update error:', error);
        } finally {
            setIsUpdatingCart(false);
        }
    }, [user, getToken]);

    const addToCart = useCallback(async (itemId) => {
        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        } else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
       
        // Debounce API call
        if (cartUpdateTimeoutRef.current) {
            clearTimeout(cartUpdateTimeoutRef.current);
        }
        cartUpdateTimeoutRef.current = setTimeout(() => {
            debouncedCartUpdate(cartData);
        }, 500); // Wait 500ms before sending API request
    }, [cartItems, debouncedCartUpdate]);

    const updateCartQuantity = useCallback(async (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData);
        
        // Debounce API call
        if (cartUpdateTimeoutRef.current) {
            clearTimeout(cartUpdateTimeoutRef.current);
        }
        cartUpdateTimeoutRef.current = setTimeout(() => {
            debouncedCartUpdate(cartData);
        }, 500); // Wait 500ms before sending API request
    }, [cartItems, debouncedCartUpdate]);

    const getCartCount = useMemo(() => {
        if (!cartItems) return 0;
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }, [cartItems]);

    const getCartAmount = useMemo(() => {
        if (!cartItems || !products.length) return 0;
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0 && itemInfo) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }, [cartItems, products]);

    useEffect(() => {
        fetchProductData()
    }, [])

    useEffect(() => {
        if (user && getToken) {
            fetchUserData()
        }
    }, [user, getToken])

    const value = {
        user, getToken,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems, isUpdatingCart,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}