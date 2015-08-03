var listener;
var message;

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
	tizen.filesystem.resolve('removable2', function(removable2){
		var num = removable2.length;
		listener.innerHTML = num + " USB is mounted";
		message.innerHTML = num + " USB is mounted";
	}, function(error){
		if(error.message == "NotFoundError"){
			listener.innerHTML = "0 USB is mounted";
			message.innerHTML = "0 USB is mounted";
		}else{
			message.innerHTML = "Error code : " + error.code + ", message:" + error.message;
		}		
	}, "r"); //You should use "r" to read 'removable2'
}

/**
 * List File list of first attached USB, if USB is mounted
 */

var RetriveMounted = function(){
	tizen.filesystem.resolve('removable2', function(removable2){
		removable2.listFiles(function(usbs){
			usbs[0].listFiles(function(files){
				for(i = 0; i < files.length; i++) {
					message.innerHTML += "file/directory list ["+ i + "] : "+ files[i].path+ files[i].name	+  "<br/>";
				}
			}, function(error){
				message.innerHTML = "Error code : " + error.code + ", message:" + error.message;
			});						
		}, function(error){
			message.innerHTML = "Error code : " + error.code + ", message:" + error.message;
		});			
	}, function(error){
		if(error.message == "NotFoundError"){
			message.innerHTML = "USB is not mounted";
		}else{
			message.innerHTML = "Error code : " + error.code + ", message:" + error.message;
		}		
	}, "r"); //You should use "r" to read 'removable2'
}


/**
 * This function use to check the external devices
 * 
 * @param storage
 */

function onStorageStateChanged(storage) {
	if(storage.label == 'removable2'){
		checkMountState();
	}
}

/**
 * Handle on external storage.
 * 
 * 
 * Note:Samsung Tizen TV always uses "removable2" as label for external device. 
 * So listStorage and getStorage are not required.
 */ 
function handleOnExternalDevice(options){
	tizen.filesystem.resolve('removable2', function(removable2){
		removable2.listFiles(function(usbs){
			tizen.filesystem.resolve(usbs[0].path + usbs[0].name, function(usb){
				switch(options){
					case 1:
						console.log("create directory"); //create abc directory, if there is
						createDirectory(usb);
						break;
					case 2:
						console.log("create File"); //create abc.txt file, if there is
						createFile(usb);
						break;
					case 3:
						console.log("create File"); //read abc.txt file, if there is
						readFile(usb);
						break;
					case 4:
						console.log("Delete Directory"); //delete abc directory, if there is
						deleteDirectory(usb);
						break;
					case 5:
						console.log("Delete File"); //delete abc.txt file, if there is
						deleteFile(usb);
						break;
					case 6:
						console.log("Download File");
						downloadToUsb(usb.path + usb.name);
						break;
               	}
			}, function(error){
				message.innerHTML = "Error code : " + error.code + ", message:" + error.message;
			}, "rw"); //You should use "rw" to write file is very important					
		}, function(error){
			message.innerHTML = "Error code : " + error.code + ", message:" + error.message;
		});			
	}, function(error){
		if(error.message == "NotFoundError"){
			message.innerHTML = "USB is not mounted";
		}else{
			message.innerHTML = "Error code : " + error.code + ", message:" + error.message;
		}		
	}, "r"); //You should use "r" to read 'removable2' 
};

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