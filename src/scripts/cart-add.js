import { supabase } from "../lib/supabase";
import { getUserFromToken } from "../scripts/validate";

// Hàm thêm sản phẩm vào giỏ hàng
async function addToCart(event) {
  event.preventDefault();
  const button = event.target;
  const originalIcon = button.innerHTML;
  button.innerHTML = '<i class="fa fa-circle-notch fa-spin"></i>';

  const token = localStorage.getItem("token");
  const username = await getUserFromToken(token);
  if (!username) {
    alert("Vui lòng đăng nhập để tiếp tục mua hàng");
    window.location.href = "/login";
  } else {
    const productId = button.dataset.pid;
    const { data: cart, error: cartError } = await supabase
      .from("cart")
      .select("*")
      .eq("username", username)
      .eq("product_id", productId);

    if (cartError) {
      console.error("Có lỗi xảy ra khi kiểm tra giỏ hàng:", cartError);
      button.innerHTML = originalIcon;
      return;
    }

    if (cart.length > 0) {
      alert("Sản phẩm đã tồn tại trong giỏ của bạn");
      button.innerHTML = originalIcon;
      return;
    }

    const { error } = await supabase
      .from("cart")
      .insert([{ username: username, product_id: productId }]);

    if (error) {
      console.error("Có lỗi xảy ra:", error);
    } else {
      alert("Thành công thêm sản phẩm vào giỏ hàng");
      button.innerHTML = originalIcon;
    }
  }
}

// Thêm sự kiện cho các nút thêm vào giỏ hàng
const cartButtons = document.querySelectorAll("#addToCartButton");
cartButtons.forEach((button) => {
  button.addEventListener("click", addToCart);
});
