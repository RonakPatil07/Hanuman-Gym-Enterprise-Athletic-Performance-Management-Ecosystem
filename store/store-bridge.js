/* ==============================================================================
   HANUMAN GYM STORE - UNIVERSAL SUB-CATEGORY CART BRIDGE
   Enables cart syncing, floating bag counter, and instant checkout across all pages
   ============================================================================== */
(function() {
    // Ensure Cart Floating Trigger exists
    function injectFloatingCart() {
        if (document.getElementById('floatingCartBtn')) return;

        let cart = [];
        try {
            const saved = localStorage.getItem('gym_store_cart');
            if (saved) cart = JSON.parse(saved);
        } catch (e) {}

        const totalCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

        const btn = document.createElement('div');
        btn.id = 'floatingCartBtn';
        btn.className = 'floating-cart-trigger';
        btn.title = 'View Cart / Checkout';
        btn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 58px;
            height: 58px;
            border-radius: 50%;
            background: #B3DD24;
            color: #000000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 25px rgba(179, 221, 36,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 9999;
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        btn.innerHTML = `
            <i class="fa-solid fa-bag-shopping" style="font-size: 20px;"></i>
            <div id="floatingCartCount" style="
                position: absolute;
                top: -4px;
                right: -4px;
                background: #ff334b;
                color: #fff;
                font-family: 'Outfit', sans-serif;
                font-size: 11px;
                font-weight: 800;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid #000;
            ">${totalCount}</div>
        `;
        btn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        document.body.appendChild(btn);

        // Toast Container
        if (!document.getElementById('cartToast')) {
            const toast = document.createElement('div');
            toast.id = 'cartToast';
            toast.className = 'cart-toast';
            toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span id="cartToastMsg">Added to cart!</span>`;
            document.body.appendChild(toast);
        }
    }

    // Intercept buy / add to cart buttons on sub-category pages
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.buy-btn-small, .buy-btn, .add-to-cart-btn, .btn-card-add-cart');
        if (!btn) return;

        const card = btn.closest('.product-card-small, .product-card, .store-product-card');
        if (!card) return;

        const nameEl = card.querySelector('h4, .product-title, .store-card-title');
        const priceEl = card.querySelector('.price, .product-price, .store-card-price');
        const imgEl = card.querySelector('img');

        const name = nameEl ? nameEl.textContent.trim() : 'Hanuman Gym Gear';
        const priceText = priceEl ? priceEl.textContent.trim() : '₹2,499';
        const rawPrice = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 2499;
        const img = imgEl ? imgEl.getAttribute('src') : 'images/hero-background-figma-7573f8.jpg';

        let cart = [];
        try {
            const saved = localStorage.getItem('gym_store_cart');
            if (saved) cart = JSON.parse(saved);
        } catch (e) {}

        const existing = cart.find(item => item.name === name);
        if (existing) {
            existing.qty = (existing.qty || 1) + 1;
        } else {
            cart.push({
                id: Date.now(),
                name: name,
                price: rawPrice,
                originalPrice: Math.round(rawPrice * 1.3),
                image: img,
                size: 'M',
                qty: 1
            });
        }

        try {
            localStorage.setItem('gym_store_cart', JSON.stringify(cart));
        } catch (e) {}

        // Update badge count
        const totalCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
        const countBadge = document.getElementById('floatingCartCount');
        if (countBadge) countBadge.textContent = totalCount;

        // Show Toast
        const toast = document.getElementById('cartToast');
        const msg = document.getElementById('cartToastMsg');
        if (toast && msg) {
            msg.textContent = `"${name}" added to cart!`;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2500);
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectFloatingCart);
    } else {
        injectFloatingCart();
    }
})();
