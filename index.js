
if (!localStorage.getItem('videos_length')) {
    localStorage.clear()
    localStorage.setItem('videos_length', '0')
} else {
    showImages()
}

var curr = 0

setInterval(() => {
    for (let i = 0; i < localStorage.getItem('videos_length'); i++) {
        if (Date.now() > localStorage.getItem(i+"_video_expiry")) {
            localStorage.removeItem(i+"_video_data")
            localStorage.removeItem(i+"_video_expiry")
            localStorage.setItem('videos_length', parseInt(localStorage.getItem('videos_length')) - 1)
        }
    }    
},2000)

function el (id){
    return document.querySelector(id)
}

el('#add').addEventListener('click', () => {
    el('#file').click()
})

function createWatchBar () {
    var bar = el('#watchbar')
    var length = localStorage.getItem('videos_length')
    var lengthint = parseInt(length)
    bar.innerHTML = ""
    for (let i = 0; i < lengthint; i++) {
        var bar_item = document.createElement('div')
        bar_item.classList.add('watchbar_item')
        bar_item.style.width = (100/lengthint)+"%"
        if (!(i >= curr+1 )) {
            console.log(i, curr)
            bar_item.style.backgroundColor = "#ff0000"
        }

        bar.appendChild(bar_item)
    }
}
var mastertimeout;

function select(index) {
    clearTimeout(mastertimeout)
    curr = index
    createWatchBar()
    el('#preview').innerHTML = ""
    if (localStorage.getItem(index+"_video_data").startsWith("data:image/")) {
        var image = document.createElement('img')
        image.src = localStorage.getItem(index+"_video_data")
        image.classList.add('preview')
        el('#preview').appendChild(image)
    } else {
        var video = document.createElement('video')
        video.src = localStorage.getItem(index+"_video_data")
        video.classList.add('preview')
        el('#preview').appendChild(video)
        video.play()
    }
    mastertimeout = setTimeout(() => {
        select(index+1)
    }, 3000)
}

function showImages () {
    el('#videos').innerHTML = ""
    for (let i = 0; i < localStorage.getItem('videos_length'); i++) {
        //is it video or image
        if (localStorage.getItem(i+"_video_data").startsWith("data:image/")) {
            var image = document.createElement('img')
            image.src = localStorage.getItem(i+"_video_data")
            image.classList.add('video_preview')
            image.addEventListener('click', () => {
                select(i)
            })
            el('#videos').appendChild(image)
        } else {
            var video = document.createElement('video')
            video.src = localStorage.getItem(i+"_video_data")
            video.classList.add('video_preview')
            el('#videos').appendChild(video)
            video.addEventListener('click', () => {
                select(i)
            })

        }



    }
}

async function getSizeofImage(src) {
    var image = document.createElement("img")
    image.src = src
    el("body").appendChild(image)

    return new Promise(resolve => {
        image.onload = () => {
            var width = image.width
            var height = image.height
            image.remove()
            resolve([width,height])
        }
    })

}

async function addVideo (src) {
    var curr_length = localStorage.getItem('videos_length')
    try {
        var size = await getSizeofImage(src)
        if (size[0]>1920 || size[1]>1080) {alert("Image could only be 1920x1080 or smaller");return}
        localStorage.setItem(curr_length+"_video_data", src)
        var expirydate = new Date()
        expirydate.setDate(expirydate.getDate() + 1)
        localStorage.setItem(curr_length+"_video_expiry",expirydate.getTime() )
        localStorage.setItem('videos_length', parseInt(curr_length) + 1)
    } catch (error) {
       localStorage.removeItem(curr_length+"_video_data")
    }
    


    showImages()
}

el('#file').addEventListener('change', () => {
    const file = el('#file').files[0]
    const reader = new FileReader()
    reader.onload = () => {
        addVideo(reader.result)
    }
    reader.readAsDataURL(file)
})