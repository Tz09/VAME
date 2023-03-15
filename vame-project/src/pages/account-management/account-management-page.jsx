import React from "react";
import axios from "axios";
import { API_URL } from "../../data/config";
import TopNavBar from "../../components/top-navbar/top-navbar";
import MaterialReactTable from "material-react-table";
import { Box,Button,Dialog,DialogActions,DialogContent,DialogTitle,IconButton,MenuItem,Stack,TextField,Tooltip,} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';


export default function AccountManagementPage() {

    const [data,setData] = React.useState([]);

    React.useEffect(() =>{
        axios.get(`${API_URL}/info`)
        .then(response=>{
            if(response.status == 200){
                const tableData = response.data.map((item) => {{
                    return {
                        ...item,
                        analytic_page_access: item.analytic_page_access ? "True" : "False"
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
                alert('Account Remove Successful.');
                window.location.href = "./accountmanagement"
            }
            })
            .catch(error => {
                console.log(error);
            })
        }
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
                        <IconButton onClick={() => table.setEditingRow(row)}>
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
                renderTopToolbarCustomActions={() => {
                    const addAccount = () => {
                        alert('add Account')
                    }
                return (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                        color="error"
                        onClick={addAccount}
                        variant="contained"
                    >
                    Add Account
                    </Button>
                    </div>
                )
                }
                }
            />
        </>
    );
  }