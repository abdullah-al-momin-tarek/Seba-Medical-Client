import {
    createBrowserRouter,
  } from "react-router-dom";
import Home from "../Pages/Home/Home";
import Root from "../Root/Root";
import Register from "../Authentication/Register";
import Login from "../Authentication/Login";
import AvailableCamps from "../Pages/AvailableCamps/AvailableCamps";
import CampDetails from "../Pages/AvailableCamps/CampDetails";

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root/>,
      children: [
        {
          path: "/",
          element: <Home/>
        },{
          path: "/register",
          element: <Register/>
        },
        {
          path: "/login",
          element: <Login/>
        },
        {
          path: "/available-camps",
          element: <AvailableCamps/>,
        },
        {
          path: "/camp-details/:campId",
          element: <CampDetails/>,
          loader: ({params})=> fetch(`http://localhost:5000/camp-details/${params.campId}`)
        }
      ]
    },
  ]);




  export default router;