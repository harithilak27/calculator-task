const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 1000;

app.use(bodyParser.json());
app.use(cors());

function calculate(expression) {
  const operators = ['+', '-', '*', '/'];
  let numStack = [];
  let opStack = [];
  let num = '';
  let lastCharWasOperator = true; 

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    if (!isNaN(char) || char === '.') {
      num += char;
      lastCharWasOperator = false;
    } else if (operators.includes(char)) {
      if (lastCharWasOperator && (char === '+' || char === '-')) {
        // Handle unary operators
        num += char;
        lastCharWasOperator = false;
      } else {
        if (num !== '') {
          numStack.push(parseFloat(num));
          num = '';
        }
        while (opStack.length > 0 && precedence(opStack[opStack.length - 1]) >= precedence(char)) {
          const b = numStack.pop();
          const a = numStack.pop();
          const op = opStack.pop();
          numStack.push(applyOperation(a, b, op));
        }
        opStack.push(char);
        lastCharWasOperator = true;
      }
    }
  }

  if (num !== '') {
    numStack.push(parseFloat(num));
  }

  while (opStack.length > 0) {
    const b = numStack.pop();
    const a = numStack.pop();
    const op = opStack.pop();
    numStack.push(applyOperation(a, b, op));
  }

  return numStack.pop();
}

function precedence(op) {
  if (op === '+' || op === '-') {
    return 1;
  }
  if (op === '*' || op === '/') {
    return 2;
  }
  return 0;
}

function applyOperation(a, b, op) {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (b === 0) throw new Error('Division by zero');
      return a / b;
  }
}

app.post('/calculate', (req, res) => {
  const { expression } = req.body;

  if (!expression) {
    return res.status(400).json({ error: 'Missing expression' });
  }

  try {
    const result = calculate(expression);
    res.json({ result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
