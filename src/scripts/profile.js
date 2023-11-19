import { supabase } from "../lib/supabase";
import { getUserFromToken } from "../scripts/validate";

const token = localStorage.getItem("token");
const username = await getUserFromToken(token);
if (!username) {
  window.location.href = "/login";
}

const { data, error } = await supabase
  .from("order")
  .select(
    `
    
      username,
      product_id,
      quantity,
      processed,
      order_id,
      product:product_id (
        product_name, product_price
      )
    `,
  )
  .eq("username", username);

export function viewOrder() {
  const ordersByUser = data.reduce((acc, item) => {
    if (!acc[item.username]) {
      acc[item.username] = [];
    }
    acc[item.username].push(item);
    return acc;
  }, {});

  // Gộp theo user (copy lại từ bên order.js nhưng lười sửa bới ko cần thiết)
  for (const [username, orders] of Object.entries(ordersByUser)) {
    // Create a div for the user's orders
    const userDiv = document.getElementById("orderTable");

    // Tạo bảng
    const table = document.createElement("table");
    table.className = "w-full text-sm text-center text-gray-500";
    userDiv.appendChild(table);

    // Tạo head cho bảng
    const thead = document.createElement("thead");
    thead.className = "text-xs text-gray-700 uppercase bg-gray-50 ";
    table.appendChild(thead);

    const tr = document.createElement("tr");
    thead.appendChild(tr);

    const headers = ["Tên sách", "Giá", "Số lượng", "Trạng thái", "Xóa"];
    headers.forEach((header) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.className = "text-base px-6 py-5";
      th.innerText = header;
      tr.appendChild(th);
    });

    // Thân bảng
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    // Thêm item vô thân
    let total = 0;
    orders.forEach((order) => {
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

      const tdStatus = document.createElement("td");
      tdStatus.className = "px-6 py-4 whitespace-nowrap";
      tdStatus.innerText = order.processed ? "Đã xử lý" : "Chưa xử lý";
      tr.appendChild(tdStatus);

      const tdRemove = document.createElement("td");
      tdRemove.className = "px-6 py-4 text-center";
      tr.appendChild(tdRemove);

      const remove = document.createElement("a");
      remove.className = "remove font-medium text-red-500 hover:underline";
      remove.href = "";
      remove.innerText = "Xóa";
      tdRemove.appendChild(remove);

      total += order.product.product_price * order.quantity;
    });

    // Div tổng giá trị đơn
    const totalDiv = document.createElement("div");
    totalDiv.className =
      "bottom-info text-lg font-semibold p-4 text-center items-center md:bg-white underline";
    totalDiv.innerText = `Tổng giá trị đơn hàng: ${(total * 108) / 100}`;

    userDiv.appendChild(totalDiv);

    document.querySelector("#unprocessed-orders").appendChild(userDiv);
  }
}

if (error) {
  console.error("Error: ", error);
} else {
  console.log("Data: ", data);
  viewOrder();
}
// Listener của nút xóa
const removeButtons = document.querySelectorAll(".remove");
removeButtons.forEach((button) => {
  button.addEventListener("click", async function (event) {
    event.preventDefault();
    const row = this.parentElement.parentElement;
    const productId = row.getAttribute("data-product-id");
    const orderId = row.getAttribute("data-order-id");
    console.log(orderId);
    const { error: deleteError } = await supabase
      .from("order")
      .delete()
      .eq("username", username)
      .eq("product_id", productId)
      .eq("order_id", orderId);

    if (deleteError) {
      console.error("Error: ", deleteError);
    } else {
      console.log(`Order ${productId} removed`);
      row.remove();
    }
  });
});

// Listener của nuts confirm
const confirmButtons = document.querySelectorAll(".btn");
confirmButtons.forEach((button) => {
  button.addEventListener("click", async function () {
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
      // Cái được process rồi thì ném sang processed-ỏderrs
      document
        .querySelector("#processed-orders")
        .appendChild(this.parentElement.parentElement);
      this.remove();
    }
  });
});
