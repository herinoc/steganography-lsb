function hideMessage() {
    const imageInput = document.getElementById('imageInput');
    const messageInput = document.getElementById('messageInput');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const outputImage = document.getElementById('outputImage');
    
    if (imageInput.files.length === 0 || messageInput.files.length === 0) {
        alert('Silakan pilih gambar dan file pesan.');
        return;
    }
    
    const imageFile = imageInput.files[0];
    const messageFile = messageInput.files[0];
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const messageReader = new FileReader();
            messageReader.onload = function(event) {
                const message = event.target.result;
                const binaryMessage = [...message].map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
                
                if (binaryMessage.length > canvas.width * canvas.height * 3) {
                    alert('Pesan terlalu besar untuk gambar ini.');
                    return;
                }
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                for (let i = 0; i < binaryMessage.length; i++) {
                    const bit = binaryMessage[i];
                    const index = i * 4;
                    data[index] = (data[index] & 0xFE) | parseInt(bit);
                }
                
                ctx.putImageData(imageData, 0, 0);
                outputImage.src = canvas.toDataURL();
            };
            messageReader.readAsText(messageFile);
        };
        img.src = URL.createObjectURL(imageFile);
    };
    reader.readAsDataURL(imageFile);
}

function extractMessage() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const extractedMessage = document.getElementById('extractedMessage');
    
    if (canvas.width === 0 || canvas.height === 0) {
        alert('Tidak ada gambar untuk ekstraksi.');
        return;
    }
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let binaryMessage = '';
    
    for (let i = 0; i < data.length; i += 4) {
        const bit = data[i] & 1;
        binaryMessage += bit;
    }
    
    const messageBytes = [];
    for (let i = 0; i < binaryMessage.length; i += 8) {
        const byte = binaryMessage.slice(i, i + 8);
        messageBytes.push(String.fromCharCode(parseInt(byte, 2)));
    }
    
    const message = messageBytes.join('');
    extractedMessage.value = message.trim();
}
