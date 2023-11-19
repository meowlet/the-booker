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

//hàm để đăng ký người dùng mới``
export async function registerUser() {
  // Lấy giá trị từ các trường input
  let username = document.querySelector("#email").value;
  let password = document.querySelector("#password").value;
  let confirmPassword = document.querySelector("#confirm-password").value;
  const errorMessage = document.querySelector("#error-message");

  //kiểm tra và yêu cầu người dùng nhập đủ 2 trường username và password
  if (username == "" || password == "") {
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
  //kiểm tra mật khẩu và xác nhận mật khẩu có khớp nhau không
  if (password != confirmPassword) {
    //trả về lỗi vào vùng errorMessage đã khai báo
    errorMessage.classList.remove("text-blue-500");
    errorMessage.classList.add("text-red-500");
    errorMessage.textContent = "Mật khẩu không khớp.";
    //thoát hàm
    return false;
  }
  //xóa nội dung chỗ thông báo lỗi
  errorMessage.innerHTML = "";

  //kiểm tra username đã tồn tại trong database chưa
  const { data } = await supabase
    .from("user")
    .select("username")
    .eq("username", username);
  if (data.length > 0) {
    //nếu username đã tồn tại, trả về lỗi vào vùng errorMessage đã khai báo
    errorMessage.classList.remove("text-blue-500");
    errorMessage.classList.add("text-red-500");
    errorMessage.textContent = "Người dùng đã tồn tại.";
    //thoát hàm
    return false;
  }

  //nếu username chưa tồn tại, thêm người dùng mới vào database
  const { error } = await supabase
    .from("user")
    .insert([{ username: `${username}`, password: `${password}` }]);
  if (error) {
    //nếu có lỗi xảy ra, hiển thị lỗi vào console
    console.error(error);
  } else {
    //nếu không có lỗi xảy ra, thông báo đăng ký thành công
    errorMessage.classList.remove("text-red-500");
    errorMessage.classList.add("text-blue-500");
    errorMessage.textContent = "Đăng ký thành công";
  }
}
