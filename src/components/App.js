import React,{useState,useEffect}  from 'react'
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import Alert from 'react-bootstrap/Alert'
import LogItem from './LogItem'
import AddLogItem from './AddLogItem'
import {ipcRenderer} from 'electron'
import { Button } from 'react-bootstrap'

const App = () => {
	const [logs,setLogs] = useState([])

	const [alert,setAlert] = useState({
		show:false,
		message:'',
		variant:'success'
	})

	useEffect(()=>{
		ipcRenderer.send('logs:load')

		ipcRenderer.on('logs:get',(e,logs)=>{
			setLogs(JSON.parse(logs))
		})
	},[])
	function addItem(item){

		if(item.text==''||item.user==''||item.priority==''){
			showAlert('Please enter all field', 'danger')
			return false
		}
		console.error(item)
		// item._id=Math.floor(Math.random()*90000)+10000
		// item.created = new Date().toString()
		// setLogs([...logs,item])

		ipcRenderer.send('logs:add',item)

		showAlert('Log Added')
	}

	function deleteItem(_id){
		// setLogs(logs.filter((item)=>item._id!==_id))

		ipcRenderer.send('logs:delete',_id);

		showAlert('Log Removed', 'secondary')
	}
	function deleteAll(){
		ipcRenderer.send('logs:deleteAll');

		showAlert('All Logs Removed','secondary')
	}
	function showAlert(message,variant='success',seconds=3000){
		setAlert({
			show:true,
			message,
			variant
		})

		setTimeout(()=>{
			setAlert({
				show:false,
				message:'',
				variant:'success'
			})
		},seconds)
	}

	return (
		<Container>
			<AddLogItem addItem={addItem}/>
			{alert.show&&<Alert variant={alert.variant}>{alert.message}</Alert>}
			<hr/>
			<Button variant="danger" style={{width:'100%'}} onClick={deleteAll}>Delete All Logs</Button>
			<hr/>
			<Table>
				<thead>
					<tr>
						<th>Priority</th>
						<th>Log Text</th>
						<th>User</th>
						<th>Created Date</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{
						logs.map((log)=>(
							 <LogItem key={log._id} log={log} deleteItem={deleteItem}/>
						))
					}
				</tbody>
			</Table>
		</Container>
	)
}

export default App
