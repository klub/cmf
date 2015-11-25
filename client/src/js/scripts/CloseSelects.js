let getParent = function(target){
    //react is adding extra nested spans >-(
    if(target.nodeName.toLowerCase() === 'span'){
        if(target.parentNode.nodeName.toLowerCase() === 'span'){
            target = target.parentNode.parentNode;
        } else {
            target = target.parentNode;
        }
    }
    return target;
};

let CloseSelects = (function(e){

    let parent = getParent(e.target);
    let selects = document.getElementById('product-list').querySelectorAll('.select');

    if(parent.className.indexOf('select') !== -1) return;

    for(var i = 0, j = selects.length; i < j; i++){
        let single = selects[i].className.indexOf('single') === -1 ? '' : ' single';
        selects[i].className = 'select' + single;
    }
});

export default CloseSelects;