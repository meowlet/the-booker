import { supabase } from "../lib/supabase";

// Hàm kiểm tra token
function checkToken() {
  const token = localStorage.getItem("token");
  const adminToken = import.meta.env.PUBLIC_ADMIN_TOKEN;
  if (token !== adminToken) {
    window.location.href = "/";
  }
}
checkToken();

// Hàm lấy dữ liệu đơn hàng từ database
async function fetchData() {
  const { data, error } = await supabase.from("order").select(
    `
      order_id,
      username,
      product_id,
      quantity,
      processed,
      product:product_id (
        product_name, product_price
      )
    `,
  );
  if (error) {
    console.error("Error: ", error);
  } else {
    console.log("Data: ", data);
    viewOrder(data);
  }
}
fetchData();

// Hàm hiển thị đơn hàng
function viewOrder(data) {
  const ordersByUser = data.reduce((acc, item) => {
    if (!acc[item.username]) {
      acc[item.username] = [];
    }
    acc[item.username].push(item);
    return acc;
  }, {});

  for (const [username, orders] of Object.entries(ordersByUser)) {
    const userDiv = createUserDiv(username);
    const table = createTable(userDiv);
    let total = 0;
    orders.forEach((order) => {
      total += createOrderRow(table, order);
    });
    createTotalDiv(userDiv, total, orders);
    appendUserDiv(userDiv, orders);
  }
}

// Hàm tạo div cho đơn hàng của mỗi người dùng
function createUserDiv(username) {
  const userDiv = document.createElement("div");
  userDiv.className =
    "items-center relative overflow-x-auto shadow-md rounded-lg border-2 border-slate-400 mb-6";
  const title = document.createElement("caption");
  title.dataset.username = `${username}`;
  title.className =
    "p-5 text-2xl font-semibold text-purple-600 bg-white w-full";
  title.innerText = `Đơn hàng của ${username}`;
  userDiv.appendChild(title);
  return userDiv;
}

// Hàm tạo bảng cho đơn hàng
function createTable(userDiv) {
  const table = document.createElement("table");
  table.className = "w-full text-sm text-center text-gray-500";
  userDiv.appendChild(table);
  const thead = document.createElement("thead");
  thead.className = "text-xs text-gray-700 uppercase bg-gray-50 ";
  table.appendChild(thead);
  const tr = document.createElement("tr");
  thead.appendChild(tr);
  const headers = ["Tên sách", "Giá", "Số lượng", "Xóa"];
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.scope = "col";
    th.className = "px-6 py-3";
    th.innerText = header;
    tr.appendChild(th);
  });
  return table;
}

// Hàm tạo hàng cho mỗi đơn hàng
function createOrderRow(table, order) {
  const tbody =
    table.querySelector("tbody") ||
    table.appendChild(document.createElement("tbody"));
  const tr = document.createElement("tr");
  tr.className = "bg-white border-b";
  tr.dataset.orderId = order.order_id;
  tr.dataset.productId = order.product_id;
  tbody.appendChild(tr);
  const tdName = document.createElement("td");
  tdName.className =
    "px-6 py-4 text-base font-medium text-gray-900 whitespace-nowrap";
  tdName.innerText = order.product.product_name;
  tr.appendChild(tdName);
  const tdPrice = document.createElement("td");
  tdPrice.className = "price px-6 py-4";
  tdPrice.innerText = order.product.product_price;
  tr.appendChild(tdPrice);
  const tdQuantity = document.createElement("td");
  tdQuantity.className = "px-6 py-4";
  tdQuantity.innerText = order.quantity;
  tr.appendChild(tdQuantity);
  const tdRemove = document.createElement("td");
  tdRemove.className = "px-6 py-4 text-center";
  tr.appendChild(tdRemove);
  const remove = document.createElement("a");
  remove.className = "remove font-medium text-red-500 hover:underline";
  remove.href = "";
  remove.innerText = "Xóa";
  tdRemove.appendChild(remove);
  remove.addEventListener("click", removeOrder);
  return order.product.product_price * order.quantity;
}

// Hàm xóa đơn hàng
async function removeOrder(event) {
  event.preventDefault();
  const row = this.parentElement.parentElement;
  const productId = row.getAttribute("data-product-id");
  const orderID = row.getAttribute("data-order-id");
  const username = row.parentElement.parentElement.parentElement
    .querySelector("caption")
    .getAttribute("data-username");
  const { error: deleteError } = await supabase
    .from("order")
    .delete()
    .eq("username", username)
    .eq("product_id", productId)
    .eq("order_id", orderID);
  if (deleteError) {
    console.error("Error: ", deleteError);
  } else {
    console.log(`Order ${productId} removed`);
    row.remove();
  }
}

// Hàm tạo div cho tổng giá trị đơn hàng
function createTotalDiv(userDiv, total, orders) {
  const lineBreak = document.createElement("div");
  const totalDiv = document.createElement("div");
  totalDiv.className =
    "bottom-info text-lg font-semibold p-4 text-center items-center md:bg-white underline";
  totalDiv.innerText = `Tổng giá trị đơn hàng: ${(total * 108) / 100}`;
  if (!orders.every((order) => order.processed)) {
    const confirmButton = document.createElement("button");
    confirmButton.className = "btn h-fit text-sm mt-3 ";
    confirmButton.innerText = "Xác nhận đơn hàng";
    confirmButton.addEventListener("click", confirmOrders);
    totalDiv.appendChild(lineBreak);
    totalDiv.appendChild(confirmButton);
  }
  userDiv.appendChild(totalDiv);
}

// Hàm xác nhận đơn hàng
async function confirmOrders() {
  const username = this.parentElement.parentElement
    .querySelector("caption")
    .getAttribute("data-username");
  const { error: updateError } = await supabase
    .from("order")
    .update({ processed: true })
    .eq("username", username);
  if (updateError) {
    console.error("Error: ", updateError);
  } else {
    console.log(`Orders for ${username} confirmed`);
    document
      .querySelector("#processed-orders")
      .appendChild(this.parentElement.parentElement);
    this.remove();
  }
}

// Hàm thêm div vào phần chưa xử lý hoặc đã xử lý
function appendUserDiv(userDiv, orders) {
  if (orders.every((order) => order.processed)) {
    document.querySelector("#processed-orders").appendChild(userDiv);
  } else {
    document.querySelector("#unprocessed-orders").appendChild(userDiv);
  }
}
