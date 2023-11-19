import { supabase } from "../lib/supabase";

// Hàm này sẽ lấy thông tin người dùng từ token
export async function getUserFromToken(token) {
  let { data, error } = await supabase
    .from("user")
    .select("username")
    .eq("token", token);

  if (error) {
    console.error("Error: ", error);
    return null;
  }

  // Giả sử rằng mỗi token chỉ tương ứng với một username
  return data.length > 0 ? data[0].username : null;
}

// Hàm này sẽ kiểm tra người dùng và chuyển hướng nếu cần
export async function checkUserAndRedirect() {
  // Lấy token từ localStorage
  const token = localStorage.getItem("token");

  if (!token) {
    toggleVisibility(["login", "signup"], ["profile", "logout"]);
    return;
  }

  // Gọi hàm getUserFromToken để lấy thông tin người dùng từ token
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
      // Nếu người dùng không phải là "admin" và đang cố gắng truy cập vào trang "dashboard", chuyển hướng họ về trang chủ
      window.location.href = "/";
    }
  } else {
    // Nếu token không hợp lệ, thông báo cho người dùng
    console.log("Token không hợp lệ");
    toggleVisibility(["login", "signup"], ["profile", "logout"]);
  }
}

// Hàm này sẽ thay đổi hiển thị của các phần tử
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
