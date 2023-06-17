import React, { useState, useEffect,useMemo } from 'react';
import axios from 'axios';
import { API_URL } from '../../data/config';
import TopNavBar from "../../components/top-navbar/top-navbar"
import MaterialReactTable from "material-react-table";
import { Box,Button,Dialog,DialogActions,DialogContent,DialogTitle,IconButton,MenuItem,Stack,TextField,Tooltip} from '@mui/material';
import { Delete, Edit,ChangeCircle,Preview} from '@mui/icons-material';
import ImageModal from '../../components/image-modal/image-modal';
import get from '../../components/http/get';
import _delete from '../../components/http/delete';
import Loader from '../../components/loader/loader';
import { LineChart, Line, CartesianGrid, XAxis, YAxis,Tooltip as RechartTooltip,Label,Legend,ResponsiveContainer} from 'recharts';

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
    const [week_data,setWeekData] = useState([]);

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

        get('week_data')
          .then(response => {
            if(response.status == 200){
              setWeekData(response.data)
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

    const columns = useMemo(
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
              <div className="card" style={{ marginBottom: '20px' }}>
                <h5 className="card-header">
                  Violated and Obstacle Detected (Weekly)
                </h5>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={week_data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <Line type="monotone" dataKey="violated" stroke="#8884d8" />
                      <Line type="monotone" dataKey="obstacle" stroke="#82ca9d"  />
                      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                      <XAxis dataKey="name" />
                      <YAxis type="number" allowDecimals={false}/>
                      <Legend verticalAlign="top" height={36}/>
                      <RechartTooltip />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <MaterialReactTable
                columns={columns}
                data={data}
                enableColumnActions={false}
                enableRowActions
                enableRowSelection
                enableColumnFilters={false}
                positionActionsColumn="last"
                positionToolbarAlertBanner="bottom"
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
                renderTopToolbarCustomActions={({ table }) => {
                  const handleDelete = () => {
                    if (
                      !confirm(`Are you sure you want to remove these data?`)
                    ) {
                      return;
                    }
                    const dates = []
                    table.getSelectedRowModel().flatRows.map((row) => {
                      const date = row.getValue('date');
                      dates.push(date);
                    });
                    const payload = {"date":dates}
                    console.log(dates)
                    _delete('dates',payload)
                      .then(response=>{
                        if(response.status == 200){
                            alert(response.data['message']);
                            window.location.href = "./dashboard";
                        }
                        })
                        .catch(error => {
                            alert(error.response.data['message']);
                            window.location.href = "./dashboard";
                        })
                  };

                  return (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button
                        color="error"
                        disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
                        onClick={handleDelete}
                        variant="contained"
                      >
                        Remove
                      </Button>
                    </div>
                  );
                }}
              />
            </div>
            }
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