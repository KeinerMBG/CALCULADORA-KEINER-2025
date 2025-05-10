// PWA Setup
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            console.log('Service worker registered!', reg);
        }).catch(err => {
            console.log('Service worker registration failed: ', err);
        });
    });
}

// Calculator logic
document.addEventListener('DOMContentLoaded', () => {
    const result = document.getElementById('result');
    const history = document.getElementById('history');
    const buttons = document.querySelectorAll('.btn');
    
    let currentValue = '0';
    let previousValue = '';
    let operation = null;
    let resetScreen = false;
    let hasDecimal = false;
    
    // Function to update display with proper formatting
    const updateDisplay = () => {
        // Format large numbers with commas
        const formatNumber = (num) => {
            // Split by decimal point
            const parts = num.toString().split('.');
            
            // Format integer part with commas
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            
            // Join back with decimal if it exists
            return parts.join('.');
        };
        
        const displayValue = formatNumber(currentValue);
        
        // Adjust font size based on length
        if (displayValue.length > 9) {
            result.classList.add('smaller');
            if (displayValue.length > 12) {
                result.classList.add('smallest');
            } else {
                result.classList.remove('smallest');
            }
        } else {
            result.classList.remove('smaller');
            result.classList.remove('smallest');
        }
        
        // Apply animation and update text
        result.textContent = displayValue;
        result.classList.add('fade-in');
        
        // Remove animation class after it completes
        setTimeout(() => {
            result.classList.remove('fade-in');
        }, 300);
    };
    
    // Update history display
    const updateHistory = () => {
        if (previousValue && operation) {
            const opSymbols = {
                'add': '+',
                'subtract': '−',
                'multiply': '×',
                'divide': '÷'
            };
            
            history.textContent = `${previousValue} ${opSymbols[operation]}`;
            history.classList.add('slide-up');
            
            setTimeout(() => {
                history.classList.remove('slide-up');
            }, 300);
        } else {
            history.textContent = '';
        }
    };

    // Reset active operation styling
    const resetActiveOperation = () => {
        document.querySelectorAll('.operation').forEach(btn => {
            btn.classList.remove('active');
        });
    };
    
    // Handle number input
    const inputNumber = (number) => {
        if (resetScreen) {
            currentValue = number;
            resetScreen = false;
            hasDecimal = false;
        } else {
            // Replace 0 with the number unless it's decimal
            if (currentValue === '0' && number !== '0' && !hasDecimal) {
                currentValue = number;
            } else {
                // Limit digit count to prevent overflow
                if (currentValue.replace(/[,.]/g, '').length < 16) {
                    currentValue += number;
                }
            }
        }
        updateDisplay();
    };
    
    // Handle decimal input
    const inputDecimal = () => {
        if (resetScreen) {
            currentValue = '0.';
            resetScreen = false;
            hasDecimal = true;
        } else if (!hasDecimal) {
            currentValue += '.';
            hasDecimal = true;
        }
        updateDisplay();
    };
    
    // Process operation
    const handleOperation = (op) => {
        // Convert string to actual number for calculation
        const current = parseFloat(currentValue.replace(/,/g, ''));
        
        // If there's a pending operation, calculate the result first
        if (previousValue !== '' && operation) {
            const prev = parseFloat(previousValue.replace(/,/g, ''));
            let result;
            
            switch (operation) {
                case 'add':
                    result = prev + current;
                    break;
                case 'subtract':
                    result = prev - current;
                    break;
                case 'multiply':
                    result = prev * current;
                    break;
                case 'divide':
                    result = prev / current;
                    break;
            }
            
            // Handle results
            if (isNaN(result) || !isFinite(result)) {
                currentValue = 'Error';
                previousValue = '';
                operation = null;
                resetScreen = true;
            } else {
                // Format result - limit decimal places if needed
                currentValue = parseFloat(result.toFixed(10)).toString();
                // Remove trailing zeros after decimal
                if (currentValue.includes('.')) {
                    currentValue = currentValue.replace(/\.?0+$/, '');
                }
                previousValue = currentValue;
            }
        } else {
            // No pending operation, just store the current value
            previousValue = currentValue;
        }
        
        // Set the new operation
        operation = op;
        resetScreen = true;
        
        // Update displays
        updateDisplay();
        updateHistory();
        
        // Style the active operation button
        resetActiveOperation();
        document.querySelector(`[data-operation="${op}"]`).classList.add('active');
    };
    
    // Calculate result
    const calculate = () => {
        // If there's no stored operation, do nothing
        if (!operation || previousValue === '') return;
        
        // Convert strings to numbers
        const current = parseFloat(currentValue.replace(/,/g, ''));
        const prev = parseFloat(previousValue.replace(/,/g, ''));
        
        let calculationResult;
        
        switch (operation) {
            case 'add':
                calculationResult = prev + current;
                break;
            case 'subtract':
                calculationResult = prev - current;
                break;
            case 'multiply':
                calculationResult = prev * current;
                break;
            case 'divide':
                calculationResult = prev / current;
                break;
        }
        
        // Handle special cases like division by zero
        if (isNaN(calculationResult) || !isFinite(calculationResult)) {
            currentValue = 'Error';
        } else {
            // Format the result with limited decimal places
            currentValue = parseFloat(calculationResult.toFixed(10)).toString();
            // Remove trailing zeros after decimal
            if (currentValue.includes('.')) {
                currentValue = currentValue.replace(/\.?0+$/, '');
            }
        }
        
        // Reset state
        previousValue = '';
        operation = null;
        resetScreen = true;
        hasDecimal = currentValue.includes('.');
        
        // Update display
        updateDisplay();
        updateHistory();
        
        // Reset styling
        resetActiveOperation();
    };
    
    // Handle clear button
    const clear = () => {
        currentValue = '0';
        previousValue = '';
        operation = null;
        resetScreen = false;
        hasDecimal = false;
        
        updateDisplay();
        updateHistory();
        resetActiveOperation();
        
        // Change AC to C if needed
        document.querySelector('[data-type="clear"]').textContent = 'AC';
    };
    
    // Handle toggle button (+/-)
    const toggleSign = () => {
        if (currentValue === '0' || currentValue === 'Error') return;
        
        if (currentValue.startsWith('-')) {
            currentValue = currentValue.substring(1);
        } else {
            currentValue = '-' + currentValue;
        }
        
        updateDisplay();
    };
    
    // Handle percent button
    const percent = () => {
        if (currentValue === 'Error') return;
        
        const value = parseFloat(currentValue.replace(/,/g, '')) / 100;
        currentValue = value.toString();
        
        // Check if we need decimal
        hasDecimal = currentValue.includes('.');
        
        updateDisplay();
    };
    
    // Add animation to buttons
    const animateButton = (button) => {
        button.classList.add('btn-pop');
        
        setTimeout(() => {
            button.classList.remove('btn-pop');
        }, 200);
    };
    
    // Event listeners for buttons
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Animate the button
            animateButton(button);
            
            // Change AC to C when any button except AC is pressed
            if (button.dataset.type !== 'clear' && currentValue !== 'Error') {
                document.querySelector('[data-type="clear"]').textContent = 'C';
            }
            
            // Handle different button types
            switch (button.dataset.type) {
                case 'number':
                    inputNumber(button.dataset.number);
                    break;
                case 'decimal':
                    inputDecimal();
                    break;
                case 'operation':
                    handleOperation(button.dataset.operation);
                    break;
                case 'equals':
                    calculate();
                    break;
                case 'clear':
                    clear();
                    break;
                case 'toggle':
                    toggleSign();
                    break;
                case 'percent':
                    percent();
                    break;
            }
        });
    });
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
        // Prevent default behavior for calculator keys
        if (
            (e.key >= '0' && e.key <= '9') || 
            e.key === '.' || 
            e.key === '+' || 
            e.key === '-' || 
            e.key === '*' || 
            e.key === '/' || 
            e.key === '=' || 
            e.key === 'Enter' || 
            e.key === 'Escape' || 
            e.key === 'Backspace' || 
            e.key === '%'
        ) {
            e.preventDefault();
        }
        
        // Map keyboard keys to buttons
        let targetButton;
        
        if (e.key >= '0' && e.key <= '9') {
            targetButton = document.querySelector(`[data-number="${e.key}"]`);
        } else {
            switch (e.key) {
                case '.':
                    targetButton = document.querySelector('[data-type="decimal"]');
                    break;
                case '+':
                    targetButton = document.querySelector('[data-operation="add"]');
                    break;
                case '-':
                    targetButton = document.querySelector('[data-operation="subtract"]');
                    break;
                case '*':
                    targetButton = document.querySelector('[data-operation="multiply"]');
                    break;
                case '/':
                    targetButton = document.querySelector('[data-operation="divide"]');
                    break;
                case '=':
                case 'Enter':
                    targetButton = document.querySelector('[data-type="equals"]');
                    break;
                case 'Escape':
                case 'c':
                case 'C':
                    targetButton = document.querySelector('[data-type="clear"]');
                    break;
                case '%':
                    targetButton = document.querySelector('[data-type="percent"]');
                    break;
            }
        }
        
        // Simulate click if button found
        if (targetButton) {
            targetButton.click();
        }
    });

    // Initial display update
    updateDisplay();
});