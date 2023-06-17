import React,{useState,useEffect,useMemo,useCallback} from "react";
import axios from "axios";
import { API_URL } from "../../data/config";
import TopNavBar from "../../components/top-navbar/top-navbar";
import MaterialReactTable from "material-react-table";
import { Box,Button,Dialog,DialogActions,DialogContent,DialogTitle,IconButton,MenuItem,Stack,TextField,Tooltip} from '@mui/material';
import { Delete, Edit,ChangeCircle } from '@mui/icons-material';
import SignupModal from "../../components/signup-modal/signup-modal";
import PasswordAppendModal from "../../components/passwordappend-modal/passwordappend-modal";
import PasswordAppendAdminModal from "../../components/passwordappendadmin-modal/passwordappendadmin";
import get from "../../components/http/get";
import _delete from "../../components/http/delete";
import put from "../../components/http/put";

export default function AccountManagementPage() {

    const [loading,setLoading] = useState(true);
    const [data,setData] = useState([]);
    const [signupopen,setSignupOpen] = useState(false);
    const [passwordappendopen,setPasswordAppendOpen] = useState(false);
    const [paswordappendadminopen,setPasswordAppendAdminOpen] = useState(false);

    const [formData,setFormData] = useState({
        username: "",
        password: "",
    });

    const [usernameError,setUsernameError] = useState('');
    const [passwordError,setPasswordError] = useState('');
    const [errorMessage,setErrorMessage] = useState('');

    const [passwordappend,setPasswordAppend] = useState('');
    const [rowUsername, setRowUsername] = useState('');

    const [adminName,setadminName] = useState('');

    const columns = useMemo(
        () => [
            {
                header: 'Username',
                accessorKey: 'username',
            },{
                header: 'Analytic Page Access',
                accessorKey: 'analytic_page_access',
            }
        ],
        [],
    );

    const handleDeleteRow = useCallback(
        (row) => {
          if (
            !confirm(`Are you sure you want to delete ${row.getValue('username')}?`)
          ) {
            return;
          }
          const payload = {"username":`${row.getValue('username')}`}
          _delete('info',payload)
          .then(response=>{
            if(response.status == 200){
                alert(response.data['message']);
                data.splice(row.index, 1);
                setData([...data]);
            }
            })
            .catch(error => {
                alert(error.response.data['message']);
                console.log(error);
            })
        },
        [data],
      );

    
    const handleChangeAccess = useCallback(
        (row) => {
            if (
                !confirm(`Are you sure you want to change access ${row.getValue('username')}?`)
              ) {
                return;
              }
            const payload = {"username":`${row.getValue('username')}`}
            put('access',payload)
            .then(response=>{
                if(response.status == 200){
                    alert(response.data['message']);
                    get('info')
                    .then(response=>{
                        if(response.status == 200){
                            const tableData = response.data.map((item) => {{
                                return {
                                    ...item,
                                    analytic_page_access: item.analytic_page_access ? "Allowed" : "Denied"
                                }
                            }})
                            setData(tableData)
                        }
                    })
                    .catch(error => {
                            console.log(error)
                    })
                }
                })
                .catch(error => {
                    alert(error.response.data['message']);
                    get('info')
                    .then(response=>{
                        if(response.status == 200){
                            const tableData = response.data.map((item) => {{
                                return {
                                    ...item,
                                    analytic_page_access: item.analytic_page_access ? "Allowed" : "Denied"
                                }
                            }})
                            setData(tableData)
                        }
                    })
                    .catch(error => {
                            console.log(error)
                    })
                })
        },
    )

    function handleSignupOpen(){
        setSignupOpen(true);
    }

    function handleSignupClose(){
        setSignupOpen(false);
        setFormData({
            username: "",
            password: "",
        });
        setUsernameError("");
        setPasswordError("");
        setErrorMessage("");
    };

    function handlePasswordAppendOpen(row){
        setRowUsername(`${row.getValue('username')}`)
        setPasswordAppendOpen(true);
    }

    function handlePasswordAppendClose(){
        setPasswordAppendOpen(false);
        setRowUsername("");
        setPasswordAppend("");
        setPasswordError("");
        setErrorMessage("");
    }

    function handlePasswordAppendAdminOpen(){
        setPasswordAppendAdminOpen(true);
    }
    
    function handlePasswordAppendAdminClose(){
        setPasswordAppendAdminOpen(false);
        setPasswordAppend("");
        setPasswordError("");
        setErrorMessage("");
    }

    useEffect(() =>{
        get('info')
        .then(response=>{
            if(response.status == 200){
                const tableData = response.data.map((item) => {{
                    return {
                        ...item,
                        analytic_page_access: item.analytic_page_access ? "Allowed" : "Denied"
                    }
                }})
                setData(tableData)
            }
        })
        .catch(error => {
                console.log(error)
        })
        
        get('admin')
        .then(response=>{
            if(response.data["message"] == 'True'){
                get('login')
                .then(response => {
                        if(response.status == 200){
                            setadminName(response.data.username);
                        }
                    }
                )
                
            }
        })
        .catch(error => {
                console.log(error)
        })

    },[])

    // useEffect(() => {
    //     (async () => {
    //       try {
    //         const resp = await get('admin');
    //         if(resp.data["message"] == 'True'){
    //             setadminName(resp.data.username);
    //         }
    //       } catch (error) {
    //         console.log(error)
    //       }
    //     })();
    //   }, []);

    return (
        <>
            <TopNavBar 
                loading={loading} 
                setLoading={setLoading}
            />
            {!loading && 
            <div className="container">
                <MaterialReactTable
                    columns={columns}
                    data={data}
                    enableRowActions
                    enableColumnFilters={false}
                    positionActionsColumn="last"
                    displayColumnDefOptions={{
                        'mrt-row-actions': {
                        muiTableHeadCellProps: {
                            align: 'center',
                        },
                        muiTableBodyCellProps:{
                            align: 'center',
                        },
                        size: 200,
                        },
                    }}
                    muiTablePaginationProps={{
                        rowsPerPageOptions: [5,10],
                    }}
                    renderRowActions={({ row, table }) => (
                        <Box>
                        <Tooltip arrow placement="right" title="Change Password">
                            <IconButton onClick={() => handlePasswordAppendOpen(row)}>
                            <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Delete">
                            <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                            <Delete />
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Change Access">
                            <IconButton onClick={() => handleChangeAccess(row)}>
                            <ChangeCircle />
                            </IconButton>
                        </Tooltip>
                        </Box>
                    )}
                    renderTopToolbarCustomActions={() => (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button
                            color="error"
                            onClick={() => handleSignupOpen(true)}
                            variant="contained"
                            >
                            Create New Account
                            </Button>
                            <Button
                            color="error"
                            onClick={() => handlePasswordAppendAdminOpen(true)}
                            variant="contained"
                            >
                                Change Admin Password
                            </Button>
                        </div>
                    )}
                />
                </div>}
                <SignupModal
                    open={signupopen} 
                    onClose={handleSignupClose} 
                    formData={formData} 
                    setFormData={setFormData} 
                    errorMessage={errorMessage} 
                    setErrorMessage={setErrorMessage} 
                    usernameError={usernameError} 
                    setUsernameError={setUsernameError}  
                    passwordError={passwordError} 
                    setPasswordError={setPasswordError} 
                />
                <PasswordAppendModal
                    open={passwordappendopen}
                    onClose={handlePasswordAppendClose}
                    rowUsername={rowUsername}
                    passwordappend={passwordappend}
                    setPasswordAppend={setPasswordAppend}
                    errorMessage={errorMessage} 
                    setErrorMessage={setErrorMessage} 
                    passwordError={passwordError} 
                    setPasswordError={setPasswordError} 
                />
                <PasswordAppendAdminModal
                    open={paswordappendadminopen}
                    onClose={handlePasswordAppendAdminClose}
                    adminName={adminName}
                    passwordappend={passwordappend}
                    setPasswordAppend={setPasswordAppend}
                    errorMessage={errorMessage} 
                    setErrorMessage={setErrorMessage} 
                    passwordError={passwordError} 
                    setPasswordError={setPasswordError} 
                />
        </>
    );
  }
