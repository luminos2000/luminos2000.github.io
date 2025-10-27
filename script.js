document.addEventListener("DOMContentLoaded", () => {
    try {
        const canvasTheory = document.getElementById('theory');
        const ctxTheory = canvasTheory.getContext('2d');
        const canvasSimulation = document.getElementById('simulation');
        const ctxSimulation = canvasSimulation.getContext('2d');
        const lambdaSlider = document.getElementById('lambdaSlider');
        const aSlider = document.getElementById('aSlider');
        const bSlider = document.getElementById('bSlider');
        const lambdaValue = document.getElementById('lambdaValue');
        const aValue = document.getElementById('aValue');
        const bValue = document.getElementById('bValue');
        const button1 = document.getElementById('button1');
        const button10 = document.getElementById('button10');
        const button1000 = document.getElementById('button1000');
        const resetButton = document.getElementById('resetButton');
        const theoryCheckbox = document.getElementById('theoryCheckbox');
        const leftSlitRadio = document.getElementById('leftSlitRadio');
        const rightSlitRadio = document.getElementById('rightSlitRadio');
        const doubleSlitRadio = document.getElementById('doubleSlitRadio');
        const setupImage = document.getElementById('setupImage');

        const lambdaDef = parseFloat(lambdaSlider.value);
        const aDef = parseFloat(aSlider.value);
        const bDef = parseFloat(bSlider.value);
        const doubleSlitDef = doubleSlitRadio.checked;
        const rightSlitDef = rightSlitRadio.checked;
        const leftSlitDef = leftSlitRadio.checked;
        const slitToggleDef = leftSlitRadio.checked ? 'left' : rightSlitRadio.checked ? 'right' : 'double';
        const theoryToggleDef = theoryCheckbox.checked;

        let lambda = lambdaDef;
        let a = aDef;
        let b = bDef;
        let slitToggle = slitToggleDef;
        let theoryToggle = theoryToggleDef;
        
        setupImage.src = slitToggle+'_'+LANGUAGE+'.png';

        const theoryPlotWidth = canvasTheory.width;
        const theoryPlotHeight = canvasTheory.height;
        const simulationPlotWidth = canvasSimulation.width;
        const simulationPlotHeight = canvasSimulation.height;
        const xMin = -Math.PI / 2;
        const xMax = Math.PI / 2;
        const yMin = 0;
        const yMax = 1;


        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

        const f = x => {
            let k = 2 * Math.PI / lambda
            if (slitToggle === 'left') {
                return (Math.sin(k * b * Math.sin(x + 0.1) / 2) / (k * b * Math.sin(x + 0.1) / 2)) ** 2;
            } else if (slitToggle === 'right') {
                return (Math.sin(k * b * Math.sin(x - 0.1) / 2) / (k * b * Math.sin(x - 0.1) / 2)) ** 2;
            } else {
                return (Math.sin(k * b * Math.sin(x) / 2) / (k * b * Math.sin(x) / 2)) ** 2
                    * (Math.cos(k * a * Math.sin(x) / 2)) ** 2;
            }
        };

        const fInt = (xMin, xMax) => {
            const xStep = 0.001;
            let integral = 0;
            for (let x = xMin; x <= xMax; x += xStep) {
                integral += f(x) * xStep;
            }
            return integral;
        };

        let norm = fInt(xMin, xMax);
        const angleArray = Array.from({ length: 401 }, (_, i) => xMin + (xMax - xMin) * i / 400);
        let countingArray = new Array(angleArray.length).fill(0);

        const resetCountingArray = () => countingArray.fill(0);

        const updateCountingArray = x => {
            const index = angleArray.findIndex(angle => x < angle);
            if (index !== -1) countingArray[index]++;
        };

        const chooseX = () => {
            const xStep = 0.001;
            const randNum = norm * Math.random();
            let integral = 0;
            for (let x = xMin; x <= xMax; x += xStep) {
                integral += f(x) * xStep;
                if (randNum < integral) {
                    return x;
                }
            }
        };

        const theoryTransformX = x => theoryPlotWidth * ((x - xMin) / (xMax - xMin));

        const theoryTransformY = y => theoryPlotHeight * (1 - (y - yMin) / (yMax - yMin));

        const simulationTransformX = x =>  simulationPlotWidth * ((x - xMin) / (xMax - xMin));

        const simulationTransformY = y => simulationPlotHeight * (1 - (y - yMin) / (yMax - yMin));

        const drawOriginLine = () => {
            const x = theoryTransformX(0);
            const y1 = theoryTransformY(yMin);
            const y2 = theoryTransformY(yMax);
            ctxTheory.beginPath();
            ctxTheory.moveTo(x, y1);
            ctxTheory.lineTo(x, y2);
            ctxTheory.setLineDash([5, 5])
            ctxTheory.strokeStyle = 'black';
            ctxTheory.stroke();
            ctxTheory.setLineDash([]);
        };

        const drawPoint = (x, y) => {
            ctxSimulation.beginPath();
            ctxSimulation.arc(simulationTransformX(x),  simulationTransformY(y), 1, 0, Math.PI * 2);
            ctxSimulation.fillStyle = 'white';
            ctxSimulation.fill();
            ctxSimulation.closePath();
        };

        const plotFunction = () => {
            ctxTheory.beginPath();
            angleArray.forEach((x, i) => {
                const canvasX = theoryTransformX(x);
                const canvasY = theoryTransformY(f(x));
                if (i === 0) {
                    ctxTheory.moveTo(canvasX, canvasY);
                } else {
                    ctxTheory.lineTo(canvasX, canvasY);
                }
            });
            ctxTheory.strokeStyle = 'black';
            ctxTheory.stroke();
        };

        const plotBarChart = () => {
            const barWidth = theoryPlotWidth / countingArray.length;
            const maxDataValue = Math.max(...countingArray);

            countingArray.forEach((value, index) => {
                const barHeight = value / maxDataValue;
                const x = theoryTransformX(angleArray[index]);
                const y = theoryTransformY(barHeight);

                ctxTheory.fillStyle = 'red';
                ctxTheory.fillRect(x, y, barWidth, barHeight * theoryPlotHeight);
            });
        };

        const updateTheoryCanvas = () => {
            ctxTheory.clearRect(0, 0, theoryPlotWidth, theoryPlotHeight);
            plotBarChart();
            if (theoryToggle) {
                plotFunction();
            }
            drawOriginLine();
        };

        const updateSimulationCanvas = async (n, time) => {
            for (let j = 0; j < n; j++) {
                await sleep(time / n);
                const randomX = chooseX();
                const randomY = Math.random();
                updateCountingArray(randomX);
                drawPoint(randomX, randomY);
            }
            updateTheoryCanvas();
        };

        const resetSimulationCanvas = () => {
            ctxSimulation.clearRect(0, 0, simulationPlotWidth, simulationPlotHeight);
        };


        const updateParameters = () => {
            slitToggle = leftSlitRadio.checked ? 'left' : rightSlitRadio.checked ? 'right' : 'double';
            
            lambda = parseFloat(lambdaSlider.value);
            a = parseFloat(aSlider.value);
            b = parseFloat(bSlider.value);

            lambdaValue.textContent = lambda;
            aValue.textContent = a;
            bValue.textContent = b;

            norm = fInt(xMin, xMax);
            setupImage.src = slitToggle+'_'+LANGUAGE+'.png';
        };

        const resetParameters = () => {
            lambdaSlider.value = lambdaDef;
            aSlider.value = aDef;
            bSlider.value = bDef;

            theoryCheckbox.checked = theoryToggleDef;
            theoryToggle = theoryToggleDef;

            doubleSlitRadio.checked = doubleSlitDef;
            rightSlitRadio.checked = rightSlitDef;
            leftSlitRadio.checked = leftSlitDef;
            updateParameters();
        };

        
        lambdaSlider.addEventListener('input', () => {
            updateParameters();
            resetSimulationCanvas();
            resetCountingArray();
            updateTheoryCanvas();
        });

        aSlider.addEventListener('input', () => {
            updateParameters();
            resetSimulationCanvas();
            resetCountingArray();
            updateTheoryCanvas();
        });

        bSlider.addEventListener('input', () => {
            updateParameters();
            resetSimulationCanvas();
            resetCountingArray();
            updateTheoryCanvas();
        });

        leftSlitRadio.addEventListener('change', () => {
            updateParameters();
            resetSimulationCanvas();
            resetCountingArray();
            updateTheoryCanvas();
        });

        rightSlitRadio.addEventListener('change', () => {
            updateParameters();
            resetSimulationCanvas();
            resetCountingArray();
            updateTheoryCanvas();
        });

        doubleSlitRadio.addEventListener('change', () => {
            updateParameters();
            resetSimulationCanvas();
            resetCountingArray();
            updateTheoryCanvas();
        });

        theoryCheckbox.addEventListener('change', () => {
            theoryToggle = theoryCheckbox.checked;
            updateTheoryCanvas();
        });


        button1.addEventListener('click', () => {
            updateSimulationCanvas(1, 0);
        });

        button10.addEventListener('click', () => {
            updateSimulationCanvas(10, 1000);
        });

        button1000.addEventListener('click', () => {
            updateSimulationCanvas(1000, 1000);
        });

        resetButton.addEventListener('click', () => {
            resetParameters();
            resetSimulationCanvas();
            resetCountingArray();
            updateTheoryCanvas();
        });

        drawOriginLine();

    } catch (error) {
        console.error('An error occurred:', error);
    }
});

