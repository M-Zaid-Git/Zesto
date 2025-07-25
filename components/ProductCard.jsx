import React, { useState } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import LoadingSpinner from './LoadingSpinner';

const ProductCard = ({ product }) => {

    const { currency, router, addToCart, isUpdatingCart } = useAppContext();
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const handleAddToCart = async (e) => {
        e.stopPropagation(); // Prevent navigation when clicking the button
        setIsAddingToCart(true);
        
        try {
            await addToCart(product._id);
        } finally {
            // Small delay to show feedback
            setTimeout(() => setIsAddingToCart(false), 500);
        }
    };

    const handleBuyNow = (e) => {
        e.stopPropagation(); // Prevent navigation when clicking the button
        router.push('/product/' + product._id);
    };

    return (
        <div
            onClick={() => { router.push('/product/' + product._id); scrollTo(0, 0) }}
            className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer group"
        >
            <div className="cursor-pointer group-hover:shadow-md transition-all duration-300 relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
                <Image
                    src={product.images[0]}
                    alt={product.name}
                    className="group-hover:scale-105 transition-transform duration-300 object-cover w-4/5 h-4/5 md:w-full md:h-full"
                    width={800}
                    height={800}
                />
                <button 
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                    {isAddingToCart ? (
                        <LoadingSpinner size="sm" />
                    ) : (
                        <Image
                            className="h-3 w-3"
                            src={assets.heart_icon}
                            alt="add to cart"
                        />
                    )}
                </button>
            </div>

            <p className="md:text-base font-medium pt-2 w-full truncate">{product.name}</p>
            <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">{product.description}</p>
            <div className="flex items-center gap-2">
                <p className="text-xs">{4.5}</p>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Image
                            key={index}
                            className="h-3 w-3"
                            src={
                                index < Math.floor(4)
                                    ? assets.star_icon
                                    : assets.star_dull_icon
                            }
                            alt="star_icon"
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-end justify-between w-full mt-1">
                <p className="text-base font-medium">{currency}{product.offerPrice}</p>
                <button 
                    onClick={handleBuyNow}
                    className="max-sm:hidden px-4 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-xs hover:bg-slate-50 hover:border-gray-500/40 active:bg-slate-100 transition-all duration-200"
                >
                    Buy now
                </button>
            </div>
        </div>
    )
}

export default ProductCard