import React, { useEffect } from "react";

function ButtonLoginGoogle(props) {


  const handleCredentialResponse = (response) => {
      // Xử lý response từ Google
      console.log("Encoded JWT ID token: " + response.credential);
      // Gửi token đến backend
      window.location.href = `http://localhost:8080/api/auth/google?credential=${response.credential}`;
    };
  
  useEffect(() => {
    // Đảm bảo script Google đã load xong
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "874573857083-rg9agnq0l74jms86v6jo7uphrhnrfr43.apps.googleusercontent.com",
        ux_mode: "redirect",
        login_uri: "http://localhost:8080/api/auth/google", 
      });
      window.google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large", shape: "pill", text: "signin_with" }
      );
    }
  }, []);

  

  return (
    <div>
      <div id="buttonDiv"></div>
    </div>
  );
}

export default ButtonLoginGoogle;