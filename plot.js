document.addEventListener("DOMContentLoaded", function() {
    const canvas_theory = document.getElementById('theory');
    const ctx_theory = canvas_theory.getContext('2d');
    const canvas_simulation = document.getElementById('simulation');
    const ctx_simulation = canvas_simulation.getContext('2d');
    const kSlider = document.getElementById('kSlider');
    const aSlider = document.getElementById('aSlider');
    const bSlider = document.getElementById('bSlider');
    const kValue = document.getElementById('kValue');
    const aValue = document.getElementById('aValue');
    const bValue = document.getElementById('bValue');
    const button1 = document.getElementById('button1');
    const button10 = document.getElementById('button10');
    const button1000 = document.getElementById('button1000');
    const resetButton = document.getElementById('resetButton');
    const theoryCheckbox = document.getElementById('theoryCheckbox');


    let k = kSlider.value;
    let a = aSlider.value;
    let b = bSlider.value;
    let theoryToggle = theoryCheckbox.checked;

    // Set up the plot area
    const plotWidth = canvas_theory.width;
    const plotHeight = canvas_theory.height;
    const xMin = - Math.PI / 2;
    const xMax = Math.PI / 2;
    const yMin = 0;
    const yMax = 1;

    let integral = f_int(xMin, xMax, 0.001, k, a, b);

    // Function to transform x value to canvas coordinates
    function transformX(x) {
        return (x - xMin) / (xMax - xMin) * plotWidth;
    }

    // Function to transform y value to canvas coordinates
    function transformY(y) {
        return plotHeight - (y - yMin) / (yMax - yMin) * plotHeight;
    }

    // Draw axes
    function drawAxes() {
        ctx_theory.beginPath();
        ctx_theory.moveTo(transformX(xMin), transformY(0));
        ctx_theory.lineTo(transformX(xMax), transformY(0));
        ctx_theory.moveTo(transformX(0), transformY(yMin));
        ctx_theory.lineTo(transformX(0), transformY(yMax));
        ctx_theory.stroke();
    }

    // Plot the function
    function plotFunction(k, a, b) {
        ctx_theory.beginPath();
        let firstPoint = true;
        for (let x = xMin; x <= xMax; x += 0.001) {
            const canvasX = transformX(x);
            const canvasY = transformY(f(x, k, a, b));
            if (firstPoint) {
                ctx_theory.moveTo(canvasX, canvasY);
                firstPoint = false;
            } else {
                ctx_theory.lineTo(canvasX, canvasY);
            }
        }
        ctx_theory.strokeStyle = 'black';
        ctx_theory.stroke();
    }

    // Define the function to plot
    function f(x, k, a, b) {
        return (Math.sin(k*b*Math.sin(x)/2)/(k*b*Math.sin(x)/2))**2 * Math.cos(k*a*Math.sin(x)/2)**2;  // Example: sine function
    }

    function f_int(xMin, xMax, xStep, k, a, b) {
        let integral = 0;
        for (let x = xMin; x <= xMax; x += xStep) {
            integral += f(x, k, a, b)*xStep;
        }
        return integral;
    }

    function choose_x(xMin, xMax, xStep, k, a, b, norm) {
        const randNum = norm*Math.random();
        let integral = 0;
        for (let x = xMin; x <= xMax; x += xStep) {
            integral += f(x, k, a, b)*xStep;
            if (randNum < integral) {
                return x;
            }
        }
    }

    function drawPoint(x, y) {
        ctx_simulation.beginPath();
        ctx_simulation.arc(x, y, 1, 0, Math.PI * 2);
        ctx_simulation.fillStyle = 'white';
        ctx_simulation.fill();
        ctx_simulation.closePath();
    }



    kSlider.addEventListener('input', () => {
        k = kSlider.value;
        kValue.textContent = k;
        integral = f_int(xMin, xMax,  0.001, k, a, b);
        ctx_theory.clearRect(0, 0, plotWidth, plotHeight);
        ctx_simulation.clearRect(0, 0, plotWidth, plotHeight);
        if (theoryToggle) {
            plotFunction(k, a, b);
        }
    });

    aSlider.addEventListener('input', () => {
        a = aSlider.value;
        aValue.textContent = a;
        integral = f_int(xMin, xMax,  0.001, k, a, b);
        ctx_theory.clearRect(0, 0, plotWidth, plotHeight);
        ctx_simulation.clearRect(0, 0, plotWidth, plotHeight);
        if (theoryToggle) {
            plotFunction(k, a, b);
        }
    });

    bSlider.addEventListener('input', () => {
        b = bSlider.value;
        bValue.textContent = b;
        integral = f_int(xMin, xMax,  0.001, k, a, b);
        ctx_theory.clearRect(0, 0, plotWidth, plotHeight);
        ctx_simulation.clearRect(0, 0, plotWidth, plotHeight);
        if (theoryToggle) {
            plotFunction(k, a, b);
        }
    });

    button1.addEventListener('click', () => {
        const randomX = choose_x(xMin, xMax, 0.001, k, a, b, integral);
        const randomY = Math.random();
        drawPoint(transformX(randomX), transformY(randomY));
    });

    button10.addEventListener('click', () => {
        for (let j = 0; j < 10; j += 1) {
            const randomX = choose_x(xMin, xMax, 0.001, k, a, b, integral);
            const randomY = Math.random();
            drawPoint(transformX(randomX), transformY(randomY));
        }
    });

    button1000.addEventListener('click', () => {
        for (let j = 0; j < 1000; j += 1) {
            const randomX = choose_x(xMin, xMax, 0.001, k, a, b, integral);
            const randomY = Math.random();
            drawPoint(transformX(randomX), transformY(randomY));
        }
    });

    resetButton.addEventListener('click', () => {
        ctx_simulation.clearRect(0, 0, plotWidth, plotHeight);
        ctx_theory.clearRect(0, 0, plotWidth, plotHeight);
        kSlider.value = 10;
        aSlider.value = 10;
        bSlider.value = 1;
        k = kSlider.value;
        a = aSlider.value;
        b = bSlider.value;
        integral = f_int(xMin, xMax,  0.001, k, a, b);
        if (theoryToggle) {
            plotFunction(k, a, b);
        }
    });

    theoryCheckbox.addEventListener('change', function() {
        if (theoryToggle) {
            theoryToggle=false;
            ctx_theory.clearRect(0, 0, plotWidth, plotHeight);
        } else {
            theoryToggle=true;
            plotFunction(k, a, b);
        }
      });

});
