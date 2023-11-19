// Kiểm tra xem có phải đang đăng nhập dưới tư cách là admin không, nếu không, redirect ngay về index
checkToken();

import { supabase } from "../lib/supabase";
let { data: product } = await supabase.from("product").select("*");
renderTable(product);

// Khởi tạo các biến cần thiết
let product_name = "";
let product_category = "";
let product_desc = "";
let product_price = 0;
let product_id = 0;
let in_stock = 0;

const button = document.querySelector(".btn-primary");

// Hàm tải hình ảnh lên Imgur
async function imageUpload() {
  const file = document.getElementById("image_upload");
  const formdata = new FormData();
  formdata.append("image", file.files[0]); // Lấy file đầu tiên trong danh sách file
  try {
    const response = await fetch("https://api.imgur.com/3/image/", {
      method: "post",
      headers: {
        Authorization: "Client-ID 9c3e7fe771c9f53",
      },
      body: formdata,
    });
    const data = await response.json();
    // Gọi hàm addProduct với tham số là giá trị product_img_src
    addProduct(data.data.link);
  } catch (error) {
    console.error(error);
  }
}

// Hàm thêm sản phẩm vào database
async function addProduct(product_img_src) {
  ({ value: product_id } = document.querySelector("#product_id"));
  ({ value: product_name } = document.querySelector("#product_name"));
  ({ value: product_category } = document.querySelector("#product_category"));
  ({ value: product_desc } = document.querySelector("#product_desc"));
  ({ value: product_price } = document.querySelector("#product_price"));
  ({ value: in_stock } = document.querySelector("#in_stock"));

  try {
    const { data } = await supabase
      .from("product")
      .select("product_id")
      .eq("product_id", product_id);

    if (data.length > 0) {
      alert(`ID sản phẩm ${product_id} đã tồn tại`);
    } else {
      const { error } = await supabase.from("product").insert([
        {
          product_id,
          product_name,
          product_price,
          product_category,
          in_stock,
          product_img_src,
          product_desc,
        },
      ]);

      if (error) {
        console.error(error);
      } else {
        alert(`Thêm sản phẩm ${product_name} thành công!`);
      }

      const { data: product } = await supabase.from("product").select("*");

      if (product) {
        console.log(product);
      }

      renderTable(product);
    }
  } catch (error) {
    console.error(error);
  }
}
// Hàm hiển thị thông tin sản phẩm lên bảng
function renderTable(product) {
  const tableBody = document.querySelector("#table-body");

  tableBody.innerHTML = "";

  for (let item of product) {
    let row = document.createElement("tr");
    let imgCell = document.createElement("td");
    let idCell = document.createElement("td");
    let nameCell = document.createElement("td");
    let priceCell = document.createElement("td");
    let stockCell = document.createElement("td");
    let deleteCell = document.createElement("td");
    let deleteButton = document.createElement("button");
    let editCell = document.createElement("td");
    let editButton = document.createElement("button");

    let image = document.createElement("img");

    // Thiết lập thuộc tính src cho phần tử hình ảnh
    image.src = item.product_img_src;
    imgCell.appendChild(image);
    idCell.textContent = item.product_id;
    nameCell.textContent = item.product_name;
    priceCell.textContent = item.product_price;
    stockCell.textContent = item.in_stock;
    imgCell.className = "md:px-6 md:py-4 border border-slate-500";
    idCell.className = "text-center font-bold border border-slate-500";
    nameCell.className = "text-center border border-slate-500";
    priceCell.className = "text-center border border-slate-500";
    stockCell.className = "text-center border border-slate-500";

    deleteButton.textContent = "Xóa";
    deleteButton.setAttribute("class", "btn btn-danger");
    deleteButton.setAttribute("data-id", item.product_id);
    deleteButton.addEventListener("click", function () {
      let id = this.getAttribute("data-id");
      deleteProduct(id);
    });

    editButton.textContent = "Sửa";
    editButton.setAttribute("class", "btn btn-primary");
    editButton.setAttribute("data-id", item.product_id);
    editButton.addEventListener("click", function () {
      let id = this.getAttribute("data-id");
      editProduct(id);
    });

    deleteCell.appendChild(deleteButton);
    deleteCell.className = "text-center border border-x-none border-slate-500";

    editCell.appendChild(editButton);
    editCell.className = "text-center border border-x-none border-slate-500";

    row.appendChild(imgCell);
    row.appendChild(idCell);
    row.appendChild(nameCell);
    row.appendChild(priceCell);
    row.appendChild(stockCell);
    row.appendChild(deleteCell);
    row.appendChild(editCell);
    row.className =
      "bg-gray-100 border-b border-blue-400 border border-slate-300";
    tableBody.appendChild(row);
  }
}
// Hàm xóa sản phẩm khỏi database
async function deleteProduct(id) {
  let confirmDelete = confirm(
    `Bạn có chắc chắn muốn xóa sản phẩm có ID ${id} không?`,
  );
  if (confirmDelete) {
    try {
      const { error } = await supabase
        .from("product")
        .delete()
        .eq("product_id", id);

      if (error) {
        console.error(error);
      } else {
        alert(`Xóa sản phẩm có ID ${id} thành công!`);
      }

      const { data: product } = await supabase.from("product").select("*");

      if (product) {
        console.log(product);
      }

      renderTable(product);
    } catch (error) {
      console.error(error);
    }
  }
}

// Thêm sự kiện click cho button để gọi hàm imageUpload()
button.addEventListener("click", async function () {
  await imageUpload();
});

async function editProduct(id) {
  // Lấy thông tin sản phẩm từ form
  ({ value: product_id } = document.querySelector("#product_id"));
  ({ value: product_name } = document.querySelector("#product_name"));
  ({ value: product_category } = document.querySelector("#product_category"));
  ({ value: product_price } = document.querySelector("#product_price"));
  ({ value: in_stock } = document.querySelector("#in_stock"));
  ({ value: product_desc } = document.querySelector("#product_desc"));

  try {
    // Cập nhật thông tin sản phẩm trong database
    const { error } = await supabase
      .from("product")
      .update({
        product_id,
        product_name,
        product_price,
        product_category,
        in_stock,
        product_desc,
      })
      .eq("product_id", id);

    if (error) {
      console.error(error);
    } else {
      alert(`Chỉnh sửa sản phẩm có ID ${id} thành công!`);
    }

    // Lấy lại danh sách sản phẩm và hiển thị lên bảng
    const { data: product } = await supabase.from("product").select("*");

    if (product) {
      console.log(product);
    }

    renderTable(product);
  } catch (error) {
    console.error(error);
  }
}

// Hàm kiểm tra giá trị token trong local storage
export function checkToken() {
  // Lấy giá trị token từ local storage
  const token = localStorage.getItem("token");

  // Lấy token của admin từ .env (biến môi trường)
  const adminToken = import.meta.env.PUBLIC_ADMIN_TOKEN;

  // Kiểm tra giá trị token
  if (token !== adminToken) {
    // Nếu giá trị token không khớp, chuyển hướng người dùng sang trang chủ
    window.location.href = "/";
  }
}
