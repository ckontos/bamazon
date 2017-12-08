var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    showProducts();
});

function showProducts() {

    connection.query('SELECT * FROM products', function(err, resp) {
        if (err) throw err;

        var table = new Table({

            head: ['Item ID', 'Product Name', 'Category', 'Price ($)', 'Quantity'],
            //set widths to scale
            colWidths: [10, 40, 18, 12, 14]
        });
        //for each row of the loop
        for (var i = 0; i < resp.length; i++) {
            //push data to table
            table.push(
                [resp[i].item_id, resp[i].product_name, resp[i].department_name, resp[i].price, resp[i].stock_quantity]
            );
        }
        console.log(table.toString());
        startShopping();
    });
}

function startShopping() {
    inquirer
        .prompt([{
                name: 'ID',
                type: 'input',
                message: 'What is the item id of the item you wish to purchase?',
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            },
            {
                name: 'quantity',
                type: 'input',
                message: 'How many units would you like to purchase?',
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            },
        ])
        .then(function(answer) {
            var idEntered = answer.ID;
            var quantityEntered = answer.quantity;
            checkout(idEntered, quantityEntered);
        });
}

function checkout(ID, quantityNeeded) {
    connection.query('SELECT * FROM products WHERE item_id = ' + ID, function(err, resp) {
        if (err) throw err;
        if (quantityNeeded <= resp[0].stock_quantity) {
            var totalCost = resp[0].price * quantityNeeded;
            console.log("-----------------------------------------");
            console.log("-----------------------------------------");
            console.log("Your purchase is being Processed . . . .");
            console.log("-----------------------------------------");
            console.log("-----------------------------------------");
            console.log("Your total for " + quantityNeeded + " " + resp[0].product_name + " is " + "$" + totalCost + ". Thank you!");
            console.log("-----------------------------------------");
            console.log("-----------------------------------------");
            connection.query('UPDATE products SET stock_quantity = stock_quantity - ' + quantityNeeded + ' WHERE item_id = ' + ID);
        }
        else {
            console.log("We currently do not have enough " + resp[0].product_name + " in stock to complete your order!");
        }
        continueShopping();
    });
}

function continueShopping() {
    inquirer
        .prompt({
            name: "continueShopping",
            type: "confirm",
            message: "Would you like to continue shopping?"
        })
        .then(function(answer) {
            if (answer.continueShopping == true) {
                showProducts();

            }
            else {
                console.log("Thank you for your business!");
                connection.end();
            }
        });

}
//console.log(this.sql);
