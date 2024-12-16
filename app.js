const API_URL = "https://6637daed288fedf6938184f2.mockapi.io/shoppings";

// Function to fetch all shopping items
async function fetchShoppingItems() {
  try {
    const response = await fetch(API_URL);
    return await response.json();
  } catch (error) {
    console.error("Error fetching shopping items:", error);
    return [];
  }
}

// Function to add or update a shopping item
async function handleFormSubmission(event) {
  event.preventDefault();

  const id = document.getElementById("id").value;
  const name = document.getElementById("name").value;
  const quantity = parseFloat(document.getElementById("quantity").value);
  const date = document.getElementById("date").value;
  const unitPrice = parseFloat(document.getElementById("unit-price").value);
  const totalPrice = (quantity * unitPrice).toFixed(2);

  const data = { name, quantity, date, unitPrice, totalPrice };

  try {
    if (id) {
      // Update existing item
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      // Create new item
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }

    window.location.href = "list.html";
  } catch (error) {
    console.error("Error saving shopping item:", error);
  }
}

// Function to populate form data for editing
async function loadFormData() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (id) {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const item = await response.json();

      document.getElementById("id").value = item.id;
      document.getElementById("name").value = item.name;
      document.getElementById("quantity").value = item.quantity;
      document.getElementById("date").value = item.date;
      document.getElementById("unit-price").value = item.unitPrice;
    } catch (error) {
      console.error("Error loading form data:", error);
    }
  }
}

// Function to display shopping list
async function loadShoppingList() {
  const searchInput = document.getElementById("search").value.toLowerCase();
  const shoppingListElement = document.getElementById("shopping-list");

  shoppingListElement.innerHTML = "";

  try {
    const items = await fetchShoppingItems();

    const filteredItems = items.filter((item) => {
      const { name, quantity, date } = item;
      return (
        name.toLowerCase().includes(searchInput) ||
        quantity.toString().includes(searchInput) ||
        date.includes(searchInput)
      );
    });

    filteredItems.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.date}</td>
        <td>${item.unitPrice}</td>
        <td>${item.totalPrice}</td>
        <td>
          <a href="index.html?id=${item.id}" class="btn btn-primary btn-sm">Edit</a>
          <button class="btn btn-danger btn-sm" onclick="deleteItem(${item.id})">Delete</button>
          <a href="detail.html?id=${item.id}" class="btn btn-info btn-sm">Details</a>
        </td>
      `;
      shoppingListElement.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading shopping list:", error);
  }
}

// Function to delete a shopping item
async function deleteItem(id) {
  if (confirm("Are you sure you want to delete this item?")) {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      loadShoppingList();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }
}

// Function to display item details
async function loadItemDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (id) {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const item = await response.json();

      document.getElementById("item-name").textContent = `Name: ${item.name}`;
      document.getElementById("item-quantity").textContent = `Quantity: ${item.quantity}`;
      document.getElementById("item-date").textContent = `Date: ${item.date}`;
      document.getElementById("item-unit-price").textContent = `Unit Price: ${item.unitPrice}`;
      document.getElementById("item-total-price").textContent = `Total Price: ${item.totalPrice}`;
    } catch (error) {
      console.error("Error loading item details:", error);
    }
  }
}

// Function to generate monthly report with totals
async function generateMonthlyReport() {
  const reportTable = document.getElementById("report-table");
  const totalQuantityElement = document.getElementById("total-quantity");
  const totalCostElement = document.getElementById("total-cost");

  reportTable.innerHTML = "";
  let totalQuantity = 0;
  let totalCost = 0;

  try {
    const items = await fetchShoppingItems();
    const reportData = {};

    // Aggregate data by month
    items.forEach(({ date, quantity, totalPrice }) => {
      const month = new Date(date).toLocaleString("default", { month: "long", year: "numeric" });
      if (!reportData[month]) {
        reportData[month] = { totalQuantity: 0, totalCost: 0 };
      }
      reportData[month].totalQuantity += parseFloat(quantity);
      reportData[month].totalCost += parseFloat(totalPrice);

      totalQuantity += parseFloat(quantity);
      totalCost += parseFloat(totalPrice);
    });

    // Populate table
    Object.keys(reportData).forEach((month) => {
      const { totalQuantity, totalCost } = reportData[month];
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${month}</td>
        <td>${totalQuantity}</td>
        <td>${totalCost.toFixed(2)}</td>
      `;
      reportTable.appendChild(row);
    });

    // Update totals
    totalQuantityElement.textContent = totalQuantity;
    totalCostElement.textContent = totalCost.toFixed(2);
  } catch (error) {
    console.error("Error generating monthly report:", error);
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("shopping-form")) {
    loadFormData();
    document.getElementById("shopping-form").addEventListener("submit", handleFormSubmission);
  }

  if (document.getElementById("shopping-list")) {
    document.getElementById("search").addEventListener("input", loadShoppingList);
    document.getElementById("clear-search").addEventListener("click", () => {
      document.getElementById("search").value = "";
      loadShoppingList();
    });
    loadShoppingList();
  }

  if (document.getElementById("item-name")) {
    loadItemDetails();
  }

  if (document.getElementById("report-table")) {
    generateMonthlyReport();
  }
});
