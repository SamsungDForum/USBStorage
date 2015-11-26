//This is not working on 2015/11/26 firmware of TV, because of firmware bug.

var listener;
var message;

var numOfMountedUSB;

//Initialize function
var init = function() {
	// TODO:: Do your initialization job
	console.log("init() called");
	listener = document.getElementById("listener");
	message = document.getElementById("message");
	
	checkMountState();
	//Adds a listener to subscribe to notifications when a change in storage state occurs.
	tizen.filesystem.addStorageStateChangeListener(onStorageStateChanged);	
};

/**
 * Check how many USB are mounted
 */
var checkMountState = function(){
	numOfMountedUSB = 0;
	var USBLabelList = "";
	tizen.filesystem.listStorages(function(storages){
		for (var i = 0; i < storages.length; i++){
			console.log(storages[i]);
			if(storages[i].type == "EXTERNAL" && storages[i].state == "MOUNTED"){
				numOfMountedUSB = numOfMountedUSB + 1;
				USBLabelList += storages[i].label + " is mounted.<br/>"
			}
		}
		listener.innerHTML = USBLabelList;
		message.innerHTML = numOfMountedUSB + " USB is mounted";
	}, function(error){
		message.innerHTML = "Error code : " + error.code + ", message:" + error.message;
	});
}

/**
 * List File list of first attached USB, if USB is mounted
 */
var RetriveMounted = function(){
	if(numOfMountedUSB == 0){
		message.innerHTML = "USB is not mounted";
	}else{
		tizen.filesystem.listStorages(function(storages){
			for (var i = 0; i < storages.length; i++){
				if(storages[i].type == "EXTERNAL" && storages[i].state == "MOUNTED"){
					tizen.filesystem.resolve(storages[i].label, function(removableStorage){
						removableStorage.listFiles(function(files){
								for(i = 0; i < files.length; i++) {
									message.innerHTML += "file/directory list ["+ i + "] : "+ files[i].path+ files[i].name	+  "<br/>";
								}
							}, function(error){
								message.innerHTML = "Error code : " + error.code + ", message:" + error.message;
							});			
						}, function(error){
							message.innerHTML = "Error code : " + error.code + ", message:" + error.message;
						});
					
					break;
				}
			}
		}, function(error){
			message.innerHTML = "Error code : " + error.code + ", message:" + error.message;
		});
	}
}


/**
 * This function use to check the external devices
 * 
 * @param storage
 */

function onStorageStateChanged(storage) {
	checkMountState();
}

/**
 * Handle on external storage.
 */ 
function handleOnExternalDevice(options){
	if(numOfMountedUSB == 0){
		message.innerHTML = "USB is not mounted";
	}else{
		tizen.filesystem.listStorages(function(storages){
			for (var i = 0; i < storages.length; i++){
				if(storages[i].type == "EXTERNAL" && storages[i].state == "MOUNTED"){
					tizen.filesystem.resolve(storages[i].label, function(removableStorage){						
						switch(options){
						case 1:
							console.log("create directory"); //create abc directory, if there is
							createDirectory(removableStorage);
							break;
						case 2:
							console.log("create File"); //create abc.txt file, if there is
							createFile(removableStorage);
							break;
						case 3:
							console.log("create File"); //read abc.txt file, if there is
							readFile(removableStorage);
							break;
						case 4:
							console.log("Delete Directory"); //delete abc directory, if there is
							deleteDirectory(removableStorage);
							break;
						case 5:
							console.log("Delete File"); //delete abc.txt file, if there is
							deleteFile(removableStorage);
							break;
						case 6:
							console.log("Download File");
							downloadToUsb(removableStorage.path + removableStorage.name);
							break;
						}
	               	});
					
					break;
				}
			}
		}, function(error){
			message.innerHTML = "Error code : " + error.code + ", message:" + error.message;
		});
	}
}
	
/**
 * create a Directory
 * 
 */

function createDirectory(usb){
	try{
		usb.createDirectory("abc");
		message.innerHTML="Directory created sucessfully";
	}catch(e){
		console.log(e);
		message.innerHTML="Directory created fail";
	} 
}

/**
 * create a File
 * 
 */

function createFile(usb){
	try{
		var file = usb.createFile("abc.txt");
		if(file != null){
			file.openStream("w",
	             function(fs) {
	                 fs.write("HelloWorld");
	                 fs.close();
	                 message.innerHTML="File created sucessfully";
	             }, function(e) {
	                 console.log("Error " + e.message);
	                 message.innerHTML="File created fail";
	             }, "UTF-8"
	         );
		}else{
			message.innerHTML="File created fail";
		}
	}catch(e){
		console.log(e);
		message.innerHTML="File created fail";
	} 
}

/**
 * read a File
 * 
 */

function readFile(usb){
	try{
		var file = usb.resolve("abc.txt");
		if(file != null){
			file.openStream("r",
	             function(fs) {
					message.innerHTML=fs.read(file.fileSize);
	                fs.close();
	             }, function(e) {
	                console.log("Error " + e.message);
	                message.innerHTML="File read fail";
	             }, "UTF-8"
	         );
		}else{
			message.innerHTML="File read fail";
		}
	}catch(e){
		console.log(e);
		message.innerHTML="File read fail";
	} 
}


/**
 * delete a Directory
 * 
 * @param files
 */
function deleteDirectory(usb) {
	console.log("Delete Directory");
	
	try{
		usb.deleteDirectory(usb.path + usb.name + "/abc", true, function() {
	        console.log("Directory Deleted");
	        message.innerHTML="Directory deleted sucessfully";
		}, function(e) {
			console.log("Error " + e.message);
			message.innerHTML="Directory deleted fail";
		});
	}catch(e){
		console.log(e);
		message.innerHTML="Directory deleted fail";
	}
}


/**
 * Delete a File
 *  
 * @param files 
 */

function deleteFile(usb) {
	console.log("Delete file");
	
	try{
		usb.deleteFile(usb.path + usb.name + "/abc.txt", function() {
	        console.log("File Deleted");
	        message.innerHTML="File deleted sucessfully";
		}, function(e) {
			console.log("Error" + e.message);
			message.innerHTML="Directory deleted fail";
		});
	}catch(e){
		console.log(e);
		message.innerHTML="File deleted fail";
	}	
}

/**
 * Download the file to USB
 * 
 */
function downloadToUsb(usb){
	console.log("Download the file in external device from url");
	var request = new tizen.DownloadRequest(
	    'http://download.tizen.org/tools/README.txt', // File URL
	    usb, // Destination directory
	    'new-file-name.txt', // New file name
	    'ALL', // Network type
	    { // HTTP headers
	        'Pragma': 'no-cache',
	        'X-Agent': 'FileDownloader'
	    }
	);
	tizen.download.start(request);
	message.innerHTML="File('new-file-name.txt') download completed";
}
/**
 * Callback method to be invoked when an error has occurred
 * 
 * @param error
 */

function onerror(error) {
    console.log("The error " + error.message +
        " occurred when listing the files in the selected folder");
}


// window.onload can work without <body onload="">
window.onload = init