var budgetController = (function() {

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if(totalIncome > 0 ) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income =  function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotals = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });

        data.totals[type] = sum;

    };

    return {
        addItem: function(type, desc, value) {
            var newItem, id;

            //create new id depends on the last item on the array
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }

            //create new item exp or inc
            if(type === 'exp') {
                newItem = new Expense(id, desc, value);
            } else if (type === 'inc') {
                newItem = new Income(id, desc, value);
            }
            //push new item to the data structure
            data.allItems[type].push(newItem);
            //return new item
            return newItem
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);
            //console.log(ids);

            if (ids !== index) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotals('exp');
            calculateTotals('inc');
            // calculate the budget income - expense
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of income spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(curr) {
                curr.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(curr) {
                return curr.getPercentage();
            });

            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data.allItems);
        }
    };

})();

var UIController = (function() {

    var DOMStrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        addBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercentagesLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        /*
        + or - before number
        exactly 2 decimal points
        comma separating thousands
        */
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'inc' ? '+' : '-') + ' ' +  int + '.' + dec;

    };

    var nodeListForEach = function(list, callback) {
        for(i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMStrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml;

            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholder string with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert HTML to DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

        },

        deleteListItem: function(itemId) {
            var el = document.getElementById(itemId);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDesc + ', ' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
                // console.log(fields);
                // console.log(fieldsArr);
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExpenses, 'exp');

            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
              document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensePercentagesLabel);

            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },

        displayMonth: function() {
          var now, year, month;
          now = new Date();
          months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

          month = now.getMonth();
          year = now.getFullYear();
          document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeType: function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' + DOMStrings.inputDesc + ',' + DOMStrings.inputValue
            );

            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.addBtn).classList.toggle('red');
        },

        getDOMStrings: function() {
            return DOMStrings;
        }
    };

})();

var appController = (function(budgetCtrl, UICtrl) {

    var setupEventListener = function() {
        var DOMStrings = UICtrl.getDOMStrings();
        //eventlistner
        document.querySelector(DOMStrings.addBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOMStrings.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOMStrings.inputType).addEventListener('change', UICtrl.changeType);

    };

    var updateBudget = function() {

        // 1. Calculate budget
        budgetCtrl.calculateBudget();
        // 2. Return budget
        var budget = budgetCtrl.getBudget();
        // 3. Display the budget
        UICtrl.displayBudget(budget);
        //console.log(budget);

    };

    var updatePercentages = function() {

        // 1. Calculate percentage
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from the budget Controller
        var percentages = budgetCtrl.getPercentages();
        // 3. Update UI with the new percentages
        console.log(percentages);
        UICtrl.displayPercentages(percentages);

    };

    var ctrlDeleteItem = function(event) {
        var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);

            // 1. delete item from the data structure
            budgetCtrl.deleteItem(type, id);
            // 2. delete item from the UI
            UICtrl.deleteListItem(itemId);
            // 3. update and show the new budget
            updateBudget();
            // 4. Calculate and Update percentages
            updatePercentages();
        }
        //console.log(itemId);
    };

    var ctrlAddItem = function() {
        var input, newItem;
        // 1. Get input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add item to the UI
            UICtrl.addListItem(newItem, input.type);
            // 4. Clear fields
            UICtrl.clearFields();
            // 5. Calculate and Update budget
            updateBudget();
            // 6. Calculate and Update percentages
            updatePercentages();
        }

    }

    return {
        init: function() {
            console.log('Application has started...');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: 0
            });
            setupEventListener();
        }
    }

})(budgetController, UIController);

appController.init();
