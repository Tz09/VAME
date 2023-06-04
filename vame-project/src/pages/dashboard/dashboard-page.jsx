import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../data/config';
import TopNavBar from "../../components/top-navbar/top-navbar"
import MaterialReactTable from "material-react-table";
import { Box,Button,Dialog,DialogActions,DialogContent,DialogTitle,IconButton,MenuItem,Stack,TextField,Tooltip} from '@mui/material';
import { Delete, Edit,ChangeCircle,Preview} from '@mui/icons-material';
import ImageModal from '../../components/image-modal/image-modal';
import get from '../../components/http/get';
import Loader from '../../components/loader/loader';

export default function DashboardPage() {
    const [loading,setLoading] = useState(true);
    const [processing,setProcessing] = useState(false);
    const [data,setData] = useState([]);
    const [imageopen,setImageOpen] = useState(false);
    const [rowData,setRowData] = useState('');
    const [violated_images,setViolatedImages] = useState([]);
    const [obstacle_images,setObstacleImages] = useState([]);
    const [violated_num,setViolatedNum]  = useState(0);
    const [obstacle_num,setObstacleNum] = useState(0);

    function handleImageOpen(row){
      setRowData(`${row.getValue('date')}`)
      setImageOpen(true);
    }

    function handleImageClose(){
      setImageOpen(false);
      setRowData("");
      setViolatedImages([]);
      setObstacleImages([]);
    }

    useEffect(() => {
      const timeout = setTimeout(() => {
        setProcessing(true)
        get('dates')
          .then(response => {
            if (response.status === 200) {
              const tableData = response.data.map((item) => {
                return {
                  "date": item
                };
              });
              setData(tableData);
            }
          })
          .catch(error => {
            console.log(error);
          }); 

        get('violated')
          .then(response => {
            if(response.status == 200){
              setViolatedNum(response.data)
            }
          })
          .catch(error => {
            console.log(error);
          })

        get('obstacle')
          .then(response => {
            if(response.status == 200){
              setObstacleNum(response.data)
            }
          })
          .catch(error => {
            console.log(error);
          })
          .finally(() =>{
            setProcessing(false);
          })

      }, 1000); 

      return () => clearTimeout(timeout); 
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
            {!loading && 
            <div className='container'>
              <div className="row">
                <div className="col-sm-6">
                  <div className="card text-white bg-danger mb-3">
                    <div className="card-body">
                      <h5 className="card-title">Number of Violated People Detected Today</h5>
                      <p className="card-text font-weight-bold" >{violated_num}</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="card text-white bg-danger mb-3">
                    <div className="card-body">
                      <h5 className="card-title">Number of Obstacles Detected Today</h5>
                      <p className="card-text font-weight-bold">{obstacle_num}</p>
                    </div>
                  </div>
                </div>
              </div>

              <MaterialReactTable
                columns={columns}
                data={data}
                enableRowActions
                enableColumnFilters={false}
                positionActionsColumn="last"
                initialState={{
                  sorting:[
                    {id:'date',desc:true}
                  ],
                  density:'compact',
                  pagination: { pageSize: 5 },
                }}
                muiTablePaginationProps={{
                  rowsPerPageOptions: [5,10],
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
              />
            </div>}
            <ImageModal
              open={imageopen}
              onClose={handleImageClose}
              date={rowData}
              violated_images={violated_images}
              setViolatedImages={setViolatedImages}
              obstacle_images={obstacle_images}
              setObstacleImages={setObstacleImages}
            />
            <Loader processing={processing}></Loader>
        </>
    );
  }