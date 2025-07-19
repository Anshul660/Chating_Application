import React, { useState } from "react";
import { useToast } from "../ui/toaster";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pic, setPic] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const postDetails = (pics) => {
    setLoading(true);
    if (!pics) {
      showToast({
        title: "Please select an image!",
        status: "warning",
      });
      setLoading(false);
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dadtdxs7o");

      fetch("https://api.cloudinary.com/v1_1/dadtdxs7o/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.secure_url);
          setPreview(data.secure_url);
          setLoading(false);
          showToast({
            title: "Profile picture uploaded 💖",
            status: "success",
          });
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
          showToast({
            title: "Upload failed 💔",
            status: "error",
            position: "top",
          });
        });
    } else {
      showToast({
        title: "Only JPEG or PNG allowed!",
        status: "warning",
      });
      setLoading(false);
    }
  };

  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    postDetails(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!name || !email || !password || !pic) {
      showToast({
        title: "Please add all fields",
        status: "warning",
        duration: 5000,
        position: "top",
      });
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      showToast({
        title: "Passwords do not match 💔",
        status: "error",
        position: "top",
      });
      return;
    }
    // console.log("🥰 User Signed Up With: ", {
    //   name,
    //   email,
    //   password,
    //   pic,
    // });
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user",
        {
          name,
          email,
          password,
          pic,
        },
        config
      );
      showToast({
        title: "User Created Successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      showToast({
        title: "Error Occurred!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Name <span>*</span>
      </label>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <label>
        Email Address <span>*</span>
      </label>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label>
        Password <span>*</span>
      </label>
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <label>
        Confirm Password <span>*</span>
      </label>
      <input
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <label className="profile-pic-label">Upload Profile Picture</label>
      <div className="profile-pic ">
        <input type="file" accept="image/*" onChange={handlePicUpload} />
      </div>
      <button
        type="submit"
        className="btn signup-btn"
        disabled={loading || password !== confirmPassword}
      >
        {loading ? "One sec, darling 💓" : "Sign Up"}
      </button>
      {preview && (
        <img
          src={preview}
          alt="Profile Preview"
          className="profile-preview"
          style={{ height: "100px", marginTop: "10px" }}
        />
      )}
    </form>
  );
};

export default Signup;
