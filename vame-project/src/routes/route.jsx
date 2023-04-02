import React from "react";
import axios from "axios";
import { API_URL } from "../data/config";
import { createBrowserRouter,createRoutesFromElements,Route,BrowserRouter,redirect} from "react-router-dom";
import LandingPage from '../pages/landing/landing-page'
import ErrorPage from '../pages/error/error-page';
import LoginPage from '../pages/login/login-page';
import AccountManagementPage from "../pages/account-management/account-management-page";
import DashboardPage from "../pages/dashboard/dashboard-page";

const router = createBrowserRouter(
    createRoutesFromElements(
    <Route>
      <Route 
        path="/login" 
        element={<LoginPage/>}
        />
      <Route 
        path ="/"
        loader = {async() =>{
          try{
            const resp = await axios.get(`${API_URL}/login`,{withCredentials: true});
          }catch(error){
            throw redirect("/login")
          }
          return null;
        }}
        element={<LandingPage/>}/>
      <Route 
        path="/accountmanagement" 
        loader = {async() =>{
          try{
            const resp = await axios.get(`${API_URL}/login`,{withCredentials: true});
            if(resp.status == 200){
              const resp2 = await axios.get(`${API_URL}/access`,{withCredentials: true});
              if(resp2.data["message"] != 'True'){
                throw redirect("/");
              }
             }
          }catch(error){
            throw redirect("/")
          }
          return null;
        }}
        element={<AccountManagementPage/>}/>
      <Route path="/dashboard" element={<DashboardPage/>}></Route>
      <Route path="*" element={<ErrorPage/>}/>
    </Route>
    )
);

export default router;