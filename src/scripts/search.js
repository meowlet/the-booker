import { supabase } from "../lib/supabase";

// Khởi tạo mảng sản phẩm
let products = [];

// Hàm lấy dữ liệu sản phẩm từ database
async function fetchProducts() {
  const { data, error } = await supabase.from("product").select("*");

  // Nếu có lỗi, in lỗi ra console
  if (error) console.error("Error: ", error);
  // Nếu không có lỗi, gán dữ liệu vào mảng sản phẩm
  else products = data;
}

// Gọi hàm lấy dữ liệu sản phẩm
fetchProducts();

// Listener ô tìm kiếm
document.getElementById("search-input").addEventListener("input", function (e) {
  let input = e.target.value;
  let resultsContainer = document.getElementById("search-results");

  // Xóa kết quả tìm kiếm cũ
  resultsContainer.innerHTML = "";
  resultsContainer.className = "hidden";

  // Khi người dùng nhập vào ô tìm kiếm
  if (input.trim() !== "") {
    // Hiển thị kết quả tìm kiếm
    resultsContainer.className =
      "mt-1 absolute items-center text-center w-full bg-white flex-col rounded-lg border-2 border-purple-400";

    // Lọc sản phẩm theo tên, id hoặc mô tả
    let results = products
      .filter(
        (product) =>
          product.product_name.toLowerCase().includes(input.toLowerCase()) ||
          product.product_id.toString().includes(input.toLowerCase()) ||
          product.product_desc.toLowerCase().includes(input.toLowerCase()),
      )
      .slice(0, 3);

    // Hiển thị kết quả tìm kiếm
    results.forEach((product) => {
      let resultItem = document.createElement("a");
      resultItem.className =
        "hover:text-lg text-base ease-in-out duration-150 block m-1 hover:text-purple-600 whitespace-nowrap line-clamp-1";
      resultItem.href = `/product/${product.product_id}`;
      resultItem.textContent = product.product_name;
      resultItem.addEventListener("mousedown", function (e) {
        e.preventDefault();
      });
      resultsContainer.appendChild(resultItem);
    });
  }
});

// Khi người dùng không focus vào ô tìm kiếm
document.getElementById("search-input").addEventListener("blur", function () {
  let resultsContainer = document.getElementById("search-results");

  // Xóa kết quả tìm kiếm sau 200ms
  setTimeout(function () {
    document.getElementById("search-input").value = "";
    resultsContainer.className = "hidden";
    resultsContainer.innerHTML = "";
  }, 200);
});

// Nếu reload thì xóa ô tìm
window.onload = function () {
  document.getElementById("search-input").value = "";
};
