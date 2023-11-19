import { supabase } from "../lib/supabase";
import { getUserFromToken } from "../scripts/validate";

const token = localStorage.getItem("token");
const username = await getUserFromToken(token);
if (!username) {
  window.location.href = "/login";
}
const { data, error } = await supabase
  .from("cart")
  .select(
    `
  username,
  product_id,
  product:product_id (
    product_name, product_price, product_img_src
  )
`,
  )
  .eq("username", username);

if (error) {
  console.error("Error: ", error);
} else {
  // Tạo HTML hiển thị sản phẩm
  let productHTML = "";
  data.forEach((item) => {
    productHTML += `
      <tr class="bg-white border-b hover:bg-gray-50" data-product-id="${item.product_id}">
        <td class="p-4">
          <img
            src="${item.product.product_img_src}"
            class="border border-gray-400 rounded-lg shadow-md w-16 md:w-32 max-w-full max-h-full"
            alt="Product image"
          />
        </td>
        <td class="px-6 py-4 font-semibold text-gray-900">
          <span class="line-clamp-1">${item.product.product_name}</span>
        </td>
        <td class="px-6 whitespace-nowrap py-4">
          <div>
            <input
              type="number"
              id="product-quantity"
              class="quantity w-16 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-1"
              value="1"
              min="0"
              required
            />
          </div>
        </td>
        <td class="price px-6 py-4 font-semibold text-gray-900" data-original-price="${item.product.product_price}">${item.product.product_price}</td>
        <td class="px-6 py-4">
          <a href="#" class="remove font-medium text-red-600 hover:underline"
            >Xóa khỏi giỏ</a
          >
        </td>
      </tr>
    `;
  });

  // Thêm sản phẩm vào bảng
  document.querySelector("tbody").innerHTML = productHTML;

  // Hàm xóa sản phẩm
  async function removeFromCart(productId) {
    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("username", username)
      .eq("product_id", productId);

    if (error) {
      console.error("Error: ", error);
    } else {
      console.log(`Product ${productId} removed from cart`);
    }
  }

  // Hàm lưu thông tin đơn hàng vào database sau khi checkout
  async function saveOrder(order) {
    // Lưu thông tin về sản phẩm bán được và số lượng tương ứng
    for (const product of order.products) {
      const { error: productError } = await supabase.from("order").insert([
        {
          username: order.username,
          product_id: product.product_id,
          quantity: product.quantity,
        },
      ]);

      if (productError) {
        console.error("Error: ", productError);
      } else {
        console.log(`Product ${product.product_id} sold`);
      }
    }
  }

  // Thêm sự kiện click cho các nút xóa
  const removeButtons = document.querySelectorAll(".remove");
  removeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const row = this.parentElement.parentElement;
      const productId = row.getAttribute("data-product-id");
      removeFromCart(productId);

      // Xóa sản phẩm khỏi table
      row.remove();
      updateTotalPrice();
    });
  });

  // Hàm cập nhật tổng giá tiền
  function updateTotalPrice() {
    let total = 0;
    const rows = document.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const priceElement = row.querySelector(".price");
      const quantityElement = row.querySelector(".quantity");
      if (priceElement && quantityElement) {
        const originalPrice = parseFloat(
          priceElement.getAttribute("data-original-price"),
        );
        const quantity = parseInt(quantityElement.value);
        const realPrice = originalPrice * quantity;
        priceElement.innerText = `${realPrice}`;
        total += realPrice;
      }
    });
    const taxes = (total * 8) / 100;
    const totalElement = document.querySelector("#total-price");
    if (totalElement) {
      document.querySelector("#taxes").innerText = `${taxes}₫`;
      totalElement.innerText = `${total}₫`;
      document.querySelector("#final-total").innerText = `${total + taxes}₫`;
    }
  }

  const quantityInputs = document.querySelectorAll(".quantity");
  quantityInputs.forEach((input) => {
    input.addEventListener("change", updateTotalPrice);
  });

  // Gọi hàm updateTotalPrice lần đầu tiên để cập nhật tổng giá tiền
  updateTotalPrice();

  // Hàm xóa tất cả sản phẩm khỏi giỏ hàng
  async function clearCart() {
    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("username", username);

    if (error) {
      console.error("Error: ", error);
    } else {
      console.log("Cart cleared");
    }
  }

  // Thêm sự kiện click cho nút checkout
  document
    .querySelector("#checkout")
    .addEventListener("click", async function () {
      // Xác nhận đơn hàng
      const confirmed = confirm("Bạn có chắc chắn muốn submit đơn hàng?");
      if (!confirmed) {
        return;
      }

      // Lấy thông tin đơn hàng
      const order = {
        username,
        products: Array.from(document.querySelectorAll("tbody tr")).map(
          (row) => ({
            product_id: row.getAttribute("data-product-id"),
            quantity: row.querySelector(".quantity").value,
          }),
        ),
      };

      // Lưu thông tin đơn hàng
      await saveOrder(order);

      // Xóa tất cả sản phẩm khỏi giỏ hàng
      await clearCart();

      // Cập nhật giao diện
      document.querySelector("tbody").innerHTML = "";
      updateTotalPrice();
      alert("Đơn hàng đã được gửi đến quản trị viên");
    });
}
