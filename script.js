let currentSaleCode = generateSaleCode();

function generateSaleCode() {
    const date = new Date();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `V${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}-${random}`;
}

const productDatabase = {
    '7891234567890': {
        name: 'Arroz Integral 1kg',
        price: 8.99
    },
    '7891234567891': {
        name: 'Feijão Preto 1kg',
        price: 6.99
    },
    '7891234567892': {
        name: 'Leite Integral 1L',
        price: 4.99
    },
    '7891234567893': {
        name: 'Pão de Forma',
        price: 5.99
    },
    '7891234567894': {
        name: 'Café 500g',
        price: 12.99
    }
};

let cartItems = {};
const barcodeInput = document.getElementById('barcode-input');
const cartItemsList = document.getElementById('cart-items');
const totalSpan = document.getElementById('total');
const totalSpan2 = document.getElementById('final-total');

barcodeInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const barcode = this.value.trim();
        if (productDatabase[barcode]) {
            addToCart(barcode);
            this.value = '';
        } else {
            alert('Produto não encontrado!');
        }
    }
});

function addToCart(barcode) {
    if (cartItems[barcode]) {
        cartItems[barcode].quantity++;
    } else {
        cartItems[barcode] = {
            ...productDatabase[barcode],
            quantity: 1
        };
    }
    updateCartDisplay();
}

function removeFromCart(barcode) {
    delete cartItems[barcode];
    updateCartDisplay();
}

function updateQuantity(barcode, delta) {
    cartItems[barcode].quantity += delta;
    if (cartItems[barcode].quantity <= 0) {
        removeFromCart(barcode);
    } else {
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    cartItemsList.innerHTML = '';
    let total = 0;
    
    Object.entries(cartItems).forEach(([barcode, item]) => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        const itemTotal = item.price * item.quantity;
        
        li.innerHTML = `
            <span>${item.name} - R$ ${item.price.toFixed(2)}</span>
            <div class="quantity-controls">
                <span>Subtotal: R$ ${itemTotal.toFixed(2)}</span>
                <button class="quantity-btn" onclick="updateQuantity('${barcode}', -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${barcode}', 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart('${barcode}')">Remover</button>
            </div>
        `;
        cartItemsList.appendChild(li);
        total += itemTotal;
    });
    
    totalSpan.textContent = total.toFixed(2);
    document.getElementById('final-total').textContent = total.toFixed(2);
}

// Payment System
const paymentMethods = document.querySelectorAll('.payment-method');
const paymentDetails = document.querySelectorAll('.payment-details');
const moneyInput = document.querySelector('#money-payment input');
const changeDisplay = document.querySelector('#change');

paymentMethods.forEach(method => {
    method.addEventListener('click', () => {
        paymentMethods.forEach(m => m.classList.remove('selected'));
        method.classList.add('selected');
        
        paymentDetails.forEach(detail => detail.classList.remove('active'));
        const selectedDetail = document.getElementById(`${method.dataset.method}-payment`);
        selectedDetail.classList.add('active');
    });
});

moneyInput?.addEventListener('input', (e) => {
    const paid = parseFloat(e.target.value) || 0;
    const total = parseFloat(totalSpan2.textContent);
    const change = paid - total;
    changeDisplay.textContent = change >= 0 ? change.toFixed(2) : '0.00';
});

function collectSaleData() {
    return {
        saleCode: currentSaleCode,
        date: document.getElementById('customer-date').value,
        customer: {
            cpf: document.getElementById('cpf').value,
            name: document.getElementById('customer-name').value
        },
        items: Object.entries(cartItems).map(([barcode, item]) => ({
            barcode,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
        })),
        payment: {
            method: document.querySelector('.payment-method.selected')?.dataset.method,
            subtotal: parseFloat(document.getElementById('total').textContent),
            discount: parseFloat(document.getElementById('discount-input').value || 0),
            finalTotal: parseFloat(document.getElementById('final-total').textContent)
        }
    };
}

function processPayment() {
    const selectedMethod = document.querySelector('.payment-method.selected');
    const total = parseFloat(totalSpan.textContent);
    
    if (!selectedMethod) {
        showPaymentError('Por favor, selecione um método de pagamento.');
        return;
    }

    if (total <= 0) {
        showPaymentError('Carrinho vazio. Adicione itens antes de pagar.');
        return;
    }

    const saleData = collectSaleData();
    
    if (!saleData.customer.cpf || !saleData.customer.name || !saleData.date) {
        showPaymentError('Por favor, preencha todos os dados do cliente.');
        return;
    }

    setTimeout(() => {
        if (Math.random() < 0.9) {
            console.log('Venda finalizada:', saleData);
            showPaymentSuccess();
            cartItems = {};
            currentSaleCode = generateSaleCode();
            updateSaleDisplay();
            updateCartDisplay();
        } else {
            showPaymentError('Erro no processamento do pagamento. Tente novamente.');
        }
    }, 1500);
}

function showPaymentSuccess() {
    const successMsg = document.querySelector('.payment-success');
    const errorMsg = document.querySelector('.payment-error');
    
    successMsg.style.display = 'block';
    errorMsg.style.display = 'none';
    
    setTimeout(() => {
        successMsg.style.display = 'none';
        paymentMethods.forEach(m => m.classList.remove('selected'));
        paymentDetails.forEach(detail => detail.classList.remove('active'));
    }, 3000);
}

function showPaymentError(message) {
    const errorMsg = document.querySelector('.payment-error');
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    
    setTimeout(() => {
        errorMsg.style.display = 'none';
    }, 3000);
}

document.getElementById('cpf').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        e.target.value = value;
    }
});

function toggleAccordion(header) {
    const content = header.nextElementSibling;
    const isActive = header.classList.contains('active');
    
    document.querySelectorAll('.accordion-header').forEach(h => {
        h.classList.remove('active');
        h.nextElementSibling.classList.remove('active');
    });
    
    if (!isActive) {
        header.classList.add('active');
        content.classList.add('active');
    }
}

window.onload = () => {
    barcodeInput.focus();
    
    const firstAccordion = document.querySelector('.accordion-header');
    if (firstAccordion) {
        toggleAccordion(firstAccordion);
    }

    updateSaleDisplay();
    
    setInterval(updateSaleDisplay, 1000);
};

function updateSaleDisplay() {
    document.getElementById('sale-code').textContent = currentSaleCode;
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    document.getElementById('sale-date').textContent = `${dateStr} ${timeStr}`;
}

document.addEventListener('click', () => {
  //  barcodeInput.focus();
});

function applyDiscount() {
    const discountInput = document.getElementById('discount-input');
    const finalTotalSpan = document.getElementById('final-total');
    const subtotal = parseFloat(totalSpan.textContent);
    
    let discount = parseFloat(discountInput.value) || 0;
    
    discount = Math.min(Math.max(discount, 0), 100);
    
    const discountAmount = subtotal * (discount / 100);
    const finalTotal = subtotal - discountAmount;
    
    finalTotalSpan.textContent = finalTotal.toFixed(2);
    
    discountInput.value = discount;
}

function searchProducts() {
    const searchTerm = barcodeInput.value.toLowerCase();
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';
    
    if (searchTerm.length < 2) {
        searchResults.style.display = 'none';
        return;
    }

    const results = Object.entries(productDatabase)
        .filter(([_, product]) => 
            product.name.toLowerCase().includes(searchTerm)
        );

    if (results.length > 0) {
        results.forEach(([barcode, product]) => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.innerHTML = `${product.name} - R$ ${product.price.toFixed(2)}`;
            div.onclick = () => {
                addToCart(barcode);
                searchResults.style.display = 'none';
                barcodeInput.value = '';
                barcodeInput.focus();
            };
            searchResults.appendChild(div);
        });
        searchResults.style.display = 'block';
    } else {
        searchResults.style.display = 'none';
    }
}

barcodeInput.addEventListener('input', searchProducts);

document.addEventListener('click', (e) => {
    const searchResults = document.getElementById('search-results');
    if (!e.target.matches('#barcode-input') && !e.target.matches('.search-results')) {
        searchResults.style.display = 'none';
    }
});