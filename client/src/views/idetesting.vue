<script>
import IDE from "../components/IDE.vue";
export default {
  components: {IDE},
  data() {
    return {
      testCases: {
        0: {name: "Valid Case: Database Table",
          texts: {
            js: `const shoppingList = [
    { item: "Apples", quantity: 4, category: "Fruit" },
    { item: "Bread", quantity: 2, category: "Bakery" },
    { item: "Milk", quantity: 1, category: "Dairy" },
    { item: "Carrots", quantity: 6, category: "Vegetable" }
];

function handleOrder(item){
  console.log("Ordering: ", item);
}


const tbody = document.getElementById("table-body");

shoppingList.forEach((entry, index) => {
    const row = document.createElement("tr");
    // Alternate row styling using className
    row.className = index % 2 === 0 ? "row-even" : "row-odd";
    const itemCell = document.createElement("td");
    const quantityCell = document.createElement("td");
    const categoryCell = document.createElement("td");
    itemCell.innerText = entry.item;
    quantityCell.innerText = entry.quantity;
    categoryCell.innerText = entry.category;

    // Style using style.setProperty
    quantityCell.style.setProperty("text-align", "center");

    if (entry.quantity > 3) {
        itemCell.className = "highlight";
        itemCell.style.setProperty("color", "green");
    }
    tbody.appendChild(row);

    row.appendChild(itemCell);
    row.appendChild(quantityCell);
    row.appendChild(categoryCell);

    row.onclick = \`handleOrder(\"\${entry.item}\")\`

});`,
            css: `#table-container {
    width: 60%;
    margin: 40px auto;
    font-family: Arial, sans-serif;
}

#shopping-table {
    width: 100%;
    border-collapse: collapse;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

#shopping-table{
    background-color: #555;
    padding: 10px;
    text-align: left;
}

.row-even {
    background-color: #f9f9f9;
}

.row-odd {
    background-color: #ffffff;
}

.highlight {
    font-weight: bold;
}`,
            html: `<div id="table-container">
    <table id="shopping-table">
        <thead>
            <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Category</th>
            </tr>
        </thead>
        <tbody id="table-body">
            <!-- Filled by JS -->
        </tbody>
    </table>
</div>`
          }
        },
      1: {name: "Error Case: Infinite Loops",
        texts: {
          js: `
function doSomething(){
  console.log("Doing something ... ")
}

function badFunc(){
    let i = 0;
    while(true){console.log(++i)};
}
console.log("created functions")
badFunc();
          `,
          css: ``,
          html:
`<button onclick = "doSomething()">Do Something</button>
<button onclick = "badFunc()">Run Infinite Loop</button>`
        }
      },
        2: {name: "Edge Case: Window Time",
          texts: {
            js: `
function runTimeout(){
  const timeout = setTimeout(()=>{
    console.log("Timed out.");
  }, 1000);
  console.log("Your timeout: ", timeout);
}
function runInterval(){
  const interval = setInterval(()=>{
    console.log("Interval occured.");
  }, 1000)
  console.log("Your interval: ", interval);
}
function runFetch(){
  const fetchData = fetch("http://datasource");
  console.log("Your fetch data: ", fetchData);
}
console.log("created functions")

            `,
            css: ``,
            html: `
<button id = "btn1" onclick = "runTimeout()">
    Run Timeout
</button>
<button id = "btn2" onclick = "runInterval()">
    Run Interval
</button>
<button id = "btn3" onclick = "runFetch()">
    Run Fetch
</button>
            `
          }
        }
      }
    }
  },
  methods: {
    setTexts(key){
      this.$refs.ide.setTexts(this.testCases[key].texts)
    }
  }
}
</script>


<template>
  <div :style = "{display: 'flex', flexDirection: 'column'}">
    <IDE ref = "ide" :js = "true" :html = "true"  :css = "true"></IDE>
    <div class = table>
      <div class = "row">
      </div>
      <div class = "row" v-for = "(test, key) in testCases" :key = key>
        <div class = "col">
          <div class = "btn btn-secondary" @click = "setTexts(key)" >Use</div>
        </div>
        <div class = "col">{{test.name}}</div>
      </div>


    </div>

  </div>
</template>

<style></style>