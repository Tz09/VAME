import React from "react";
import axios from "axios";
import { API_URL } from "../data/config";
import { createBrowserRouter,createRoutesFromElements,Route,BrowserRouter,redirect} from "react-router-dom";
import LandingPage from '../pages/landing/landing-page'
import ErrorPage from '../pages/error/error-page';
import LoginPage from '../pages/login/login-page';
import AccountManagementPage from "../pages/account-management/account-management-page";
import DashboardPage from "../pages/dashboard/dashboard-page";
import get from "../components/http/get";

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
            await get('login');
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
            const resp = await get('admin')
            if (resp.data['message'] != 'True'){
              throw redirect("/")
            }
          }catch(error){
            throw redirect("/")
          }
          return null;
        }}
        element={<AccountManagementPage/>}/>
      <Route path="/dashboard" 
        loader = {async() =>{
          try{
            const resp = await get('access')
            if(resp.data['message'] != 'True'){
              throw redirect("/");
            }
          }catch(error){
            throw redirect("/")
          }
          return null;
        }} element={<DashboardPage/>}></Route>
      <Route path="*" element={<ErrorPage/>}/>
    </Route>
    )
);

export default router;