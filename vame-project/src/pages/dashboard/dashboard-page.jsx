import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../data/config';
import TopNavBar from "../../components/top-navbar/top-navbar"
import MaterialReactTable from "material-react-table";
import { Box,Button,Dialog,DialogActions,DialogContent,DialogTitle,IconButton,MenuItem,Stack,TextField,Tooltip} from '@mui/material';
import { Delete, Edit,ChangeCircle,Preview} from '@mui/icons-material';
import ImageModal from '../../components/image-modal/image-modal';

export default function DashboardPage() {
    const [loading,setLoading] = React.useState(true);
    const [data,setData] = React.useState([]);
    const [imageopen,setImageOpen] = React.useState(false);
    const [rowData,setRowData] = React.useState('');
    const [images,setImages] = useState([]);

    function handleImageOpen(row){
      setRowData(`${row.getValue('date')}`)
      setImageOpen(true);
    }

    function handleImageClose(){
      setImageOpen(false);
      setRowData("");
      setImages([]);
    }

    useEffect(() => {
      axios.get(`${API_URL}/dates`)
      .then(response=>{
          if(response.status == 200){
              const tableData = response.data.map((item) => {{
                  return {
                      "date":item
                  }
              }})
              setData(tableData)
          }
      })
      .catch(error => {
              console.log(error)
      })
    }, []);

    const columns = React.useMemo(
      () => [
          {
              header: 'Date',
              accessorKey: 'date',
              sortDescFirst: true,
          }
      ],
      [],
    );

    return (
        <>
            <TopNavBar loading={loading} setLoading={setLoading}/>
            {!loading && <MaterialReactTable
              columns={columns}
              data={data}
              enableRowActions
              enableColumnFilters={false}
              initialState={{
                sorting:[
                  {id:'date',desc:true}
                ]
              }}
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
                  <Tooltip arrow placement="right" title="Show Images">
                    <IconButton onClick={() => handleImageOpen(row)}>
                      <Preview />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            />}
            <ImageModal
              open={imageopen}
              onClose={handleImageClose}
              date={rowData}
              images={images}
              setImages={setImages}
            />
        </>
    );
  }