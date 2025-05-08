document.addEventListener('DOMContentLoaded', function() {
    // Payment Tabs
    const paymentTabs = document.querySelectorAll('.payment-tab');
    const paymentContents = document.querySelectorAll('.payment-tab-content');
    
    paymentTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            paymentTabs.forEach(tab => tab.classList.remove('active'));
            paymentContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.dataset.tab;
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
    
    // Credit Card Form Validation
    const creditCardForm = document.getElementById('credit-card-form');
    const cardNumberInput = document.getElementById('card-number');
    const expiryDateInput = document.getElementById('expiry-date');
    const cvvInput = document.getElementById('cvv');
    
    // Format credit card number with spaces
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = '';
            
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            e.target.value = formattedValue;
            
            // Limit to 19 characters (16 digits + 3 spaces)
            if (e.target.value.length > 19) {
                e.target.value = e.target.value.slice(0, 19);
            }
        });
    }
    
    // Format expiry date (MM/YY)
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            
            if (value.length > 0) {
                // First two digits (month)
                let month = value.substring(0, 2);
                // If month is greater than 12, set it to 12
                if (parseInt(month) > 12 && month.length === 2) {
                    month = '12';
                }
                formattedValue = month;
                
                // Add slash if we have 2 or more digits
                if (value.length >= 2) {
                    formattedValue += '/';
                }
                
                // Year digits
                if (value.length > 2) {
                    formattedValue += value.substring(2, 4);
                }
            }
            
            e.target.value = formattedValue;
            
            // Limit to 5 characters (MM/YY)
            if (e.target.value.length > 5) {
                e.target.value = e.target.value.slice(0, 5);
            }
        });
    }
    
    // Format CVV (3 or 4 digits)
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            e.target.value = value;
            
            // Limit to 4 characters (some cards like Amex have 4-digit CVV)
            if (e.target.value.length > 4) {
                e.target.value = e.target.value.slice(0, 4);
            }
        });
    }
    
    // Pay Now Button
    const payNowBtn = document.getElementById('pay-now-btn');
    
    if (payNowBtn) {
        payNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get active payment tab
            const activeTab = document.querySelector('.payment-tab.active');
            const paymentMethod = activeTab.dataset.tab;
            
            // Check if terms are accepted
            const acceptTerms = document.getElementById('accept-terms');
            const acceptPolicy = document.getElementById('accept-policy');
            
            if (!acceptTerms || !acceptTerms.checked) {
                alert('กรุณายอมรับเงื่อนไขและข้อตกลงในการจองตั๋วเครื่องบิน');
                return;
            }
            
            if (!acceptPolicy || !acceptPolicy.checked) {
                alert('กรุณายอมรับนโยบายความเป็นส่วนตัวของ SkyBooking');
                return;
            }
            
            // Validate payment details based on selected payment method
            if (paymentMethod === 'credit-card') {
                if (!validateCreditCardForm()) {
                    return;
                }
            } else if (paymentMethod === 'e-wallet') {
                if (!validateEWalletForm()) {
                    return;
                }
            }
            
            // Simulate payment processing
            simulatePaymentProcessing();
        });
    }
    
    // Validate credit card form
    function validateCreditCardForm() {
        const cardNumber = cardNumberInput.value.replace(/\s/g, '');
        const cardHolder = document.getElementById('card-holder').value;
        const expiryDate = expiryDateInput.value;
        const cvv = cvvInput.value;
        
        if (!cardNumber || cardNumber.length < 16) {
            alert('กรุณากรอกหมายเลขบัตรให้ถูกต้อง');
            cardNumberInput.focus();
            return false;
        }
        
        if (!cardHolder) {
            alert('กรุณากรอกชื่อผู้ถือบัตร');
            document.getElementById('card-holder').focus();
            return false;
        }
        
        if (!expiryDate || expiryDate.length < 5) {
            alert('กรุณากรอกวันหมดอายุบัตรให้ถูกต้อง (MM/YY)');
            expiryDateInput.focus();
            return false;
        }
        
        // Check if card is expired
        const [month, year] = expiryDate.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
        const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
        
        if (parseInt(year) < currentYear || 
            (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
            alert('บัตรของคุณหมดอายุแล้ว กรุณาใช้บัตรอื่น');
            expiryDateInput.focus();
            return false;
        }
        
        if (!cvv || cvv.length < 3) {
            alert('กรุณากรอกรหัส CVV ให้ถูกต้อง');
            cvvInput.focus();
            return false;
        }
        
        return true;
    }
    
    // Validate e-wallet form
    function validateEWalletForm() {
        const walletOptions = document.querySelectorAll('input[name="wallet"]');
        let selectedWallet = false;
        
        walletOptions.forEach(option => {
            if (option.checked) {
                selectedWallet = true;
            }
        });
        
        if (!selectedWallet) {
            alert('กรุณาเลือกช่องทางการชำระเงิน');
            return false;
        }
        
        const walletPhone = document.getElementById('wallet-phone').value;
        if (!walletPhone || !/^0\d{9}$/.test(walletPhone.replace(/-/g, ''))) {
            alert('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เช่น 0xx-xxx-xxxx)');
            document.getElementById('wallet-phone').focus();
            return false;
        }
        
        return true;
    }
    
    // Simulate payment processing
    function simulatePaymentProcessing() {
        // Disable pay button and show loading state
        payNowBtn.disabled = true;
        payNowBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังดำเนินการ...';
        
        // Simulate payment processing delay
        setTimeout(() => {
            // Simulate successful payment
            window.location.href = 'confirmation.html';
        }, 3000);
    }
    
    // Discount Code Functionality
    const discountBtn = document.querySelector('.discount-input button');
    
    if (discountBtn) {
        discountBtn.addEventListener('click', function() {
            const discountInput = document.querySelector('.discount-input input');
            const discountCode = discountInput.value.trim();
            
            if (!discountCode) {
                alert('กรุณากรอกรหัสส่วนลด');
                return;
            }
            
            // Simulate discount code validation
            if (discountCode.toUpperCase() === 'SKYPROMO') {
                // Update total price (this is just for demo)
                const totalPrice = document.querySelector('.summary-item.total .summary-value');
                totalPrice.innerHTML = '฿1,431';
                totalPrice.style.color = '#4caf50';
                
                // Show success message
                alert('ใช้รหัสส่วนลดสำเร็จ! คุณได้รับส่วนลด 10%');
                
                // Disable discount input
                discountInput.disabled = true;
                discountBtn.disabled = true;
                discountBtn.innerHTML = 'ใช้แล้ว';
            } else {
                alert('รหัสส่วนลดไม่ถูกต้องหรือหมดอายุ');
            }
        });
    }
});