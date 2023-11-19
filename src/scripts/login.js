import { supabase } from "../lib/supabase";

//hàm để kiểm tra độ dài của mật khẩu
function checkPasswordLength(password) {
  //nếu mật khẩu có độ dài từ 6 đến 30 ký tự, trả về true
  if (password.length >= 6 && password.length <= 30) {
    return true;
  }
  //nếu không, trả về false
  else {
    return false;
  }
}

//hàm để xác thực thông tin đăng nhập
async function validateForm() {
  //gán các giá trị đã nhập cho các biến email và password
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  //gán biến cho vùng <span> hiện thông báo
  const errorMessage = document.querySelector("#error-message");
  //kiểm tra và yêu cầu người dùng nhập đủ 2 trường username và password
  if (email == "" || password == "") {
    //trả về lỗi vào vùng errorMessage đã khai báo
    errorMessage.classList.remove("text-blue-500");
    errorMessage.classList.add("text-red-500");
    errorMessage.textContent =
      "Vui lòng nhập đầy đủ tên người dùng và mật khẩu!";
    //thoát hàm
    return false;
  }
  //kiểm tra độ dài của mật khẩu
  if (!checkPasswordLength(password)) {
    //trả về lỗi vào vùng errorMessage đã khai báo
    errorMessage.classList.remove("text-blue-500");
    errorMessage.classList.add("text-red-500");
    errorMessage.textContent = "Mật khẩu phải có độ dài từ 6 đến 30 ký tự!";
    //thoát hàm
    return false;
  }
  //xóa nội dung chỗ thông báo lỗi
  errorMessage.innerHTML = "";

  //kiểm tra thông tin nhập vào đã khớp với thông tin trong database chưa
  let { data } = await supabase
    //fetch database
    .from("user")
    .select("username, password, token")
    .filter("username", "eq", email)
    .filter("password", "eq", password);
  //lọc ra những người dùng có username và password trùng với giá trị nhập vào
  if (data.length === 1) {
    //nếu có một người dùng hợp lệ, thông báo đăng nhập thành công
    errorMessage.classList.remove("text-red-500");
    errorMessage.classList.add("text-blue-500");
    errorMessage.textContent = "Đăng nhập thành công.";
    localStorage.setItem("token", data[0].token);
    window.location.href = "../";
  } else {
    //nếu không có người dùng hợp lệ, hoặc có nhiều hơn một người dùng hợp lệ, thông báo tên người dùng hoặc mật khẩu không chính xác
    errorMessage.classList.remove("text-blue-500");
    errorMessage.classList.add("text-red-500");
    errorMessage.textContent = "Tên người dùng hoặc mật khẩu không chính xác.";
  }
}

document
  .getElementById("submit-button")
  .addEventListener("click", async function (event) {
    event.preventDefault();
    validateForm();
  });
