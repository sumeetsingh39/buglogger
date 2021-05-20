const path = require('path')
const url = require('url')
const { app, BrowserWindow, ipcMain } = require('electron')

const connectDB = require('./config/db')
const Log = require('./models/Log')


connectDB()

let mainWindow

let isDev = false

if (
	process.env.NODE_ENV !== undefined &&
	process.env.NODE_ENV === 'development'
) {
	isDev = true
}

function createMainWindow() {
	mainWindow = new BrowserWindow({
		width:isDev?1400: 1100,
		height: 800,
		backgroundColor:'white',
		show: false,
		icon: `${__dirname}/assets/icons/icon.png`,
		webPreferences: {
			nodeIntegration: true,
		},
	})

	let indexPath

	if (isDev && process.argv.indexOf('--noDevServer') === -1) {
		indexPath = url.format({
			protocol: 'http:',
			host: 'localhost:8080',
			pathname: 'index.html',
			slashes: true,
		})
	} else {
		indexPath = url.format({
			protocol: 'file:',
			pathname: path.join(__dirname, 'dist', 'index.html'),
			slashes: true,
		})
	}

	mainWindow.loadURL(indexPath)

	// Don't show until we are ready and loaded
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()

		// Open devtools if dev
		if (isDev) {
			const {
				default: installExtension,
				REACT_DEVELOPER_TOOLS,
			} = require('electron-devtools-installer')

			installExtension(REACT_DEVELOPER_TOOLS).catch((err) =>
				console.log('Error loading React DevTools: ', err)
			)
			mainWindow.webContents.openDevTools()
		}
	})

	mainWindow.on('closed', () => (mainWindow = null))
}

app.on('ready', createMainWindow)



ipcMain.on('logs:load',sendLogs)

async function sendLogs(){
try {
	const logs  = await Log.find().sort({created:1})
	mainWindow.webContents.send('logs:get',JSON.stringify(logs))
} catch (error) {
	console.log(error)
}
}


//Create log

ipcMain.on('logs:add',async (e,item)=>{
	// console.log(item)
	try {
		await Log.create(item)
		sendLogs()
	} catch (error) {
		console.log(error)
	}
})
ipcMain.on('logs:delete',async (e,_id)=>{
	try {
		await Log.findOneAndDelete({_id})
		sendLogs()
	} catch (error) {
		console.log(error)
	}
})
ipcMain.on('logs:deleteAll',async (e)=>{
	try {
		await Log.deleteMany({})
		sendLogs()
	} catch (error) {
		console.log(error)
	}
})
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (mainWindow === null) {
		createMainWindow()
	}
})

// Stop error
app.allowRendererProcessReuse = true
