import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { useState } from "react";
import { useForm } from "react-hook-form";
import moment from 'moment'
import { Helmet } from "react-helmet-async";


const imageKey = import.meta.env.VITE_imgKey;
const imgAPI = `https://api.imgbb.com/1/upload?key=${imageKey}`;
const ManageCamp = () => {
    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure()
    const [selectedCamp, setSelectedCamp] = useState(null);
    const { register, handleSubmit, reset } = useForm();
    const [currentPage, setCurrentPage] = useState(0);
    
    
    // {campName, dateTime, campFees, location, healthcareProfessionalName, participantCount, image, description}


    // pagination
    const {data:itemCount=[]} = useQuery({
        queryKey: ['itemCount'],
        queryFn: async() =>{
            const res = await axiosPublic.get('/campCount');
            return res.data.count;
        }
    })
    const numberOfPage = Math.ceil(itemCount / 10)
    const pages = [...Array(numberOfPage).keys()];

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    }

    const handleNextPage = () => {
        if (currentPage < pages.length - 1) {
            setCurrentPage(currentPage + 1);
        }
    }


    const {data: camps=[],refetch, isLoading } = useQuery({
        queryKey: ['manageCamps', currentPage],
        queryFn: async() =>{
            const res = await axiosPublic.get(`/manageCamps?page=${currentPage}&size=${10}`);
            console.log(res.data);
         return res.data
        }
    })



    const handleEdit = (camp) => {
        setSelectedCamp(camp);
        reset(camp); 
        document.getElementById('edit_modal').showModal();
    };



    const onSubmit = async (data) => {
        const imageFile = {image: data.image[0]}
        const img = await axiosPublic.post(imgAPI, imageFile, {
            headers: {
                'content-type' : 'multipart/form-data',
            }
        });

        if(img.data.success){
            const campId = selectedCamp._id
            data.image = img.data.data.display_url;
            axiosSecure.put(`/update-camp/${campId}`, data)
            .then(res=>{
                console.log(' i am modified', res.data);
                if(res.data.modifiedCount >0){
                    Swal.fire({
                        title: "Update!",
                        text: "Camp Updated successfull.",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1000
                })
                refetch();
                document.getElementById('edit_modal').close(); 
            }
            })
            

            
        }
        
    };





    const handleDelete = async (campId) => {

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
          }).then( async(result) => {
            if (result.isConfirmed) {
                const res =  await axiosSecure.delete(`/delete-camp/${campId}`);
                console.log(res.data);
                Swal.fire({
                 title: "Deleted!",
                 text: "Camp has been deleted.",
                 icon: "success",
                 showConfirmButton: false,
                 timer: 1000
               });
                 refetch();
            }
          });
        
          


    }
    return (
        <div>
            <Helmet>
        <title>Seba Medical | Manage Camps</title>
      </Helmet>
            <h2 className="font-bold text-3xl text-center mb-6">Manage Camps</h2>
           <div className="flex justify-center items-center">
           {
                isLoading && <span className="loading loading-ring loading-lg text-center"></span>
            }
           </div>
            <div className="overflow-x-auto">
  <table className="table table-xs">
    <thead>
      <tr>
        <th></th> 
        <th>Name</th> 
        <th>Date & Time</th> 
        <th>Location</th> 
        <th>Healthcare Professional</th> 
        <th>Edit</th> 
        <th>Delete</th>
      </tr>
    </thead> 
    <tbody>
      {
        camps.map((camp, idx)=> <tr key={camp._id}>
            <th>{idx+1}</th> 
            <td>{camp.campName}</td> 
            <td>{moment(camp.dateTime).format('lll')}</td> 
            <td>{camp.location}</td> 
            <td>{camp.healthcareProfessionalName}</td> 
            <td><button onClick={()=>handleEdit(camp)}><FaRegEdit className="text-xl"/></button></td> 
            <td><button onClick={()=>handleDelete(camp._id)}><MdDelete className="text-xl" /></button></td>
          </tr>)
      }
      
    </tbody> 
   
  </table>
</div>


<dialog id="edit_modal" className="modal">
                <div className="modal-box">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <label className="form-control w-full max-w-xs">
                            <div className="label">
                                <span className="label-text">Camp Name</span>
                            </div>
                            <input
                                {...register("campName", { required: true })}
                                type="text"
                                placeholder="Camp Name"
                                className="input input-bordered w-full max-w-xs"
                            />
                        </label>
                        <label className="form-control w-full max-w-xs">
                            <div className="label">
                                <span className="label-text">Date & Time</span>
                            </div>
                            <input
                                {...register("dateTime", { required: true })}
                                type="datetime-local"
                                className="input input-bordered w-full max-w-xs"
                            />
                        </label>
                        <label className="form-control w-full max-w-xs">
                            <div className="label">
                                <span className="label-text">Location</span>
                            </div>
                            <input
                                {...register("location", { required: true })}
                                type="text"
                                placeholder="Location"
                                className="input input-bordered w-full max-w-xs"
                            />
                        </label>
                        <label className="form-control w-full max-w-xs">
                            <div className="label">
                                <span className="label-text">Healthcare Professional Name</span>
                            </div>
                            <input
                                {...register("healthcareProfessionalName", { required: true })}
                                type="text"
                                placeholder="Healthcare Professional"
                                className="input input-bordered w-full max-w-xs"
                            />
                        </label>
                        <label className="form-control w-full max-w-xs">
                            <div className="label">
                                <span className="label-text">Description</span>
                            </div>
                            <textarea
                                {...register("description", { required: true })}
                                placeholder="Description"
                                className="textarea textarea-bordered w-full max-w-xs"
                            />
                        </label>
                        <label className="form-control w-full max-w-xs">
                            <div className="label">
                                <span className="label-text">Image</span>
                            </div>
                            <input
                                {...register("image")}
                                required
                                type="file"
                                className="file-input file-input-bordered file-input-primary w-full max-w-xs"
                            />
                        </label>

                        <div className="modal-action">
                            <button type="submit" className="btn btn-primary">Save</button>
                            <button  className="btn" onClick={() => document.getElementById('edit_modal').close()}>Cancel</button>
                        </div>
                    </form>
                </div>
            </dialog>
            {/* Pagination */}
            <div className="flex justify-center mt-12">
            <div aria-label="Pagination" className="inline-flex -space-x-px rounded-md shadow-sm bg-gray-100 text-gray-800">
	<button onClick={handlePrevPage}  className="inline-flex items-center px-2 py-2 text-sm font-semibold border rounded-l-md border-gray-300">
		<span className="sr-only">Previous</span>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="w-5 h-5">
			<path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
		</svg>
	</button>
	{
        pages.map(page=> <button key={page} onClick={()=>setCurrentPage(page)} className={`inline-flex items-center px-4 py-2 text-sm font-semibold border border-gray-300 ${currentPage === page ? 'bg-violet-600 text-white' : 'bg-blue-100'}`}>{page}</button>)
    }
	
	<button onClick={handleNextPage} className="inline-flex items-center px-2 py-2 text-sm font-semibold border rounded-r-md border-gray-300">
		<span className="sr-only">Next</span>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="w-5 h-5">
			<path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
		</svg>
	</button>
</div>
            </div>
{/* Pagination end */}
        </div>
    );
};

export default ManageCamp;