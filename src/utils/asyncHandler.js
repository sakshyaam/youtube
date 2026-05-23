// asyncHandler is the fucntion that receives another function called func

//func is usually your real route code

//async(req,res,next) -> function that asynchandler returns
// const asyncHandler = (func) => async (req,res,next) =>{

//     try {
//         await func(req,res,next) //runs the actual/controller function that we passed into asyncHandler and w
//         //wait for it to finish
        
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         }) 
//     }
// }

// using promise

const asyncHandler = (requestHandler) =>{
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch(
            (err) => next(err)
        )
    }
}



export {asyncHandler};
