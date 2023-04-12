import React from "react";
import axios from "axios";
import { API_URL } from "../../data/config";
import TopNavBar from "../../components/top-navbar/top-navbar";
import MaterialReactTable from "material-react-table";
import { Box,Button,Dialog,DialogActions,DialogContent,DialogTitle,IconButton,MenuItem,Stack,TextField,Tooltip} from '@mui/material';
import { Delete, Edit,ChangeCircle } from '@mui/icons-material';
import SignupModal from "../../components/signup-modal/signup-modal";
import PasswordAppendModal from "../../components/passwordappend-modal/passwordappend-modal";
import PasswordAppendAdminModal from "../../components/passwordappendadmin-modal/passwordappendadmin";

export default function AccountManagementPage() {

    const [loading,setLoading] = React.useState(true);
    const [data,setData] = React.useState([]);
    const [signupopen,setSignupOpen] = React.useState(false);
    const [passwordappendopen,setPasswordAppendOpen] = React.useState(false);
    const [paswordappendadminopen,setPasswordAppendAdminOpen] = React.useState(false);

    const [formData,setFormData] = React.useState({
        username: "",
        password: "",
    });

    const [usernameError,setUsernameError] = React.useState('');
    const [passwordError,setPasswordError] = React.useState('');
    const [errorMessage,setErrorMessage] = React.useState('');

    const [passwordappend,setPasswordAppend] = React.useState('');
    const [rowUsername,setRowUsername] = React.useState('');

    const [adminName,setadminName] = React.useState('');

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

    React.useEffect(() =>{
        axios.get(`${API_URL}/info`)
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
    },[])

    React.useEffect(() => {
        (async () => {
          try {
            const resp = await axios.get(`${API_URL}/login`,{withCredentials: true});
            if(resp.status == 200){
              const resp2 = await axios.get(`${API_URL}/admin`,{withCredentials: true});
              if(resp2.data["message"] == 'True'){
                setadminName(resp.data.username);
              }
            }
          } catch (error) {
            console.log(error)
          }
        })();
      }, []);

    const columns = React.useMemo(
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

    const handleDeleteRow = React.useCallback(
        (row) => {
          if (
            !confirm(`Are you sure you want to delete ${row.getValue('username')}?`)
          ) {
            return;
          }
          const payload = {"username":`${row.getValue('username')}`}
          axios.delete(`${API_URL}/info`,{ data: payload },{withCredentials: true})
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

    
    const handleChangeAccess = React.useCallback(
        (row) => {
            if (
                !confirm(`Are you sure you want to change access ${row.getValue('username')}?`)
              ) {
                return;
              }
            const payload = {"username":`${row.getValue('username')}`}
            axios.put(`${API_URL}/access`,payload,{withCredentials: true})
            .then(response=>{
                if(response.status == 200){
                    alert(response.data['message']);
                    axios.get(`${API_URL}/info`)
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
                    axios.get(`${API_URL}/info`)
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

    return (
        <>
            <TopNavBar 
                loading={loading} 
                setLoading={setLoading}
            />
            {!loading && <MaterialReactTable
                columns={columns}
                data={data}
                enableRowActions
                enableColumnFilters={false}
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
            />}
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
