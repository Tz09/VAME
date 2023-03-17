import React from "react";
import axios from "axios";
import { API_URL } from "../../data/config";
import TopNavBar from "../../components/top-navbar/top-navbar";
import MaterialReactTable from "material-react-table";
import { Box,Button,Dialog,DialogActions,DialogContent,DialogTitle,IconButton,MenuItem,Stack,TextField,Tooltip} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import SignupModal from "../../components/signup-modal/signup-modal";
import PasswordAppendModal from "../../components/passwordappend-modal/passwordappend-modal";

export default function AccountManagementPage() {

    const [data,setData] = React.useState([]);
    const [signupopen,setSignupOpen] = React.useState(false);
    const [passwordappendopen,setPasswordAppendOpen] = React.useState(false);

    const [formData,setFormData] = React.useState({
        username: "",
        password: "",
    });

    const [usernameError,setUsernameError] = React.useState('');
    const [passwordError,setPasswordError] = React.useState('');
    const [errorMessage,setErrorMessage] = React.useState('');

    const [passwordappend,setPasswordAppend] = React.useState('');
    const [rowUsername,setRowUsername] = React.useState('');

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
        setUsernameError("");
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

    return (
        <>
            <TopNavBar/>
            <MaterialReactTable
                columns={columns}
                data={data}
                enableRowActions
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
                      <Tooltip arrow placement="left" title="Edit">
                        <IconButton onClick={() => handlePasswordAppendOpen(row)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip arrow placement="right" title="Delete">
                        <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                )}
                renderTopToolbarCustomActions={() => (
                    <Button
                      color="error"
                      onClick={() => setSignupOpen(true)}
                      variant="contained"
                    >
                      Create New Account
                    </Button>
                )}
            />
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
        </>
    );
  }