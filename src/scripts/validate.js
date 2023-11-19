import { supabase } from "../lib/supabase";

// Hàm lấy thông tin người dùng từ token
export async function getUserFromToken(token) {
  let { data, error } = await supabase
    .from("user")
    .select("username")
    .eq("token", token);

  if (error) {
    console.error("Error: ", error);
    return null;
  }

  // Mỗi token chỉ tương ứng với một username (chắc thế)
  return data.length > 0 ? data[0].username : null;
}

// Hàm kiểm tra người dùng và redirect nếu cần
export async function checkUserAndRedirect() {
  // Bốc token từ localStorage
  const token = localStorage.getItem("token");

  if (!token) {
    toggleVisibility(["login", "signup"], ["profile", "logout"]);
    return;
  }

  // Gọi hàm getUserFromToken để bốc ra username từ token
  const username = await getUserFromToken(token);

  if (username) {
    if (window.location.pathname === "/login") {
      window.location.href = "/";
    }

    const profileWelcome = document.getElementById("profile-text");
    profileWelcome.textContent = `Xin chào, ${username}`;
    toggleVisibility(["profile", "logout"], ["login", "signup"]);
    if (username === "admin") {
      toggleVisibility(["dashboard"], []);
    } else if (window.location.pathname === "/dashboard") {
      // Nếu người dùng không phải là "admin" mà đòi vô trang "dashboard", redirect về trang chủ (phương án tạm thời, không hiệu quả nếu có người thực sự muốn cheat)
      window.location.href = "/";
    }
  } else {
    // Token không hợp lệ thì thông báo
    console.log("Token không hợp lệ");
    toggleVisibility(["login", "signup"], ["profile", "logout"]);
  }
}

// Hàm sửa phần hiển thị của các elements
function toggleVisibility(showIds, hideIds) {
  showIds.forEach((id) => {
    const showElement = document.getElementById(id);
    showElement.classList.remove("hidden");
  });

  hideIds.forEach((id) => {
    const hideElement = document.getElementById(id);
    hideElement.classList.add("hidden");
  });
}
