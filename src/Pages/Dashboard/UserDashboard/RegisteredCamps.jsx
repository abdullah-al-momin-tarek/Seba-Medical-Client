    import {  useQuery, useQueryClient } from "@tanstack/react-query";
    import useAxiosSecure from "../../../Hooks/useAxiosSecure";
    import useAuth from "../../../Hooks/useAuth";
    import Payment from "./Payment/Payment";
    import { useState } from "react";
    import Swal from "sweetalert2";
    import { Rating } from '@smastrom/react-rating'
    import '@smastrom/react-rating/style.css'



    const RegisteredCamps = () => {
        const { user } = useAuth();
        const axiosSecure = useAxiosSecure();
        const [rating, setRating] = useState(0)
          const queryClient = useQueryClient();
        const [selectedCamp, setSelectedCamp] = useState(null);
        const { data: registeredCamps, isLoading, refetch } = useQuery({
            queryKey: ['participant', user.email],
            queryFn: async () => {
                const res = await axiosSecure.post(`participant/${user.email}`);
                return res.data; 
            }
        });
        
        
        if (isLoading) {
            return <span className="loading loading-ring loading-lg"></span>;
        }

        const handlePaymentSuccess = () => {
            setSelectedCamp(null);
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Your Payment Successfull",
                showConfirmButton: false,
                timer: 1500
              });
            queryClient.invalidateQueries(['registeredCamps', user.email]);
        };
        
        const handlePayment = (camp) => {
            setSelectedCamp(camp);
            console.log("shikder", camp);
        };

        // Feedback
        const handleFeedback = (event, camp) =>{
            event.preventDefault();
            const description = event.target.description.value;
            console.log('tarek', rating);

            const feedback = {rating, description, campId: camp._id, campName: camp.campName, Name: user.displayName, email: user.email}
            console.log(feedback);

            axiosSecure.post('/feedback', feedback)
            .then(res=>{
                console.log(res.data);
                if(res.data.insertedId){
                    Swal.fire({
                        title: "Feedback!",
                        text: "Feedback has been submitted",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1000
                      });
                      document.getElementById('feedback_modal').close()
                }
            })

        }


        const handleCancel = id =>{
            


            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
              }).then((result) => {
                if (result.isConfirmed) {
                    axiosSecure.delete(`/participant_camp/${id}`)
                    .then(res=>{
                        if(res.data.deletedCount){
                            Swal.fire({
                                title: "Deleted!",
                                text: "Your file has been deleted.",
                                icon: "success",
                                showConfirmButton: false,
                                timer: 1000
                              });
                              refetch()
                        }
                    })
                }
              });



        }


        return (
            <div>
                <h2 className="text-2xl font-bold text-center mb-4">Registered Camps</h2>
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Serial</th>
                            <th className="py-2 px-4 border-b">Camp Name</th>
                            <th className="py-2 px-4 border-b">Camp Fees</th>
                            <th className="py-2 px-4 border-b">Participant Name</th>
                            <th className="py-2 px-4 border-b">Payment Status</th>
                            <th className="py-2 px-4 border-b">Confirmation Status</th>
                            <th className="py-2 px-4 border-b">Feedback</th>
                            <th className="py-2 px-4 border-b">Cancel</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registeredCamps.map((camp, idx) => (
                            <tr key={camp._id}>
                                <th className="py-2 px-4 border-b">{idx+1}</th>
                                <td className="py-2 px-4 border-b">{camp.campName}</td>
                                <td className="py-2 px-4 border-b">৳{camp.campFees}</td>
                                <td className="py-2 px-4 border-b">{user.displayName}</td>
                                <td className="py-2 px-4 border-b">
                                    {camp.paymentStatus === 'Paid' ? (
                                        <span className="text-green-600">Paid</span>
                                    ) : (
                                        <button
                                            className="bg-blue-500 text-white py-1 px-2 rounded"
                                            onClick={() => handlePayment(camp)}
                                        >
                                            Pay
                                        </button>
                                    )}
                                </td>
                                <td className="py-2 px-4 border-b">{camp?.confirmationStatus}</td>
                                <td className="py-2 px-4 border-b">
                                    {camp?.paymentStatus === 'Paid' && camp?.confirmationStatus === 'Confirmed' && (
                                        <button
                                            className="bg-yellow-500 text-white py-1 px-2 rounded"
                                            // onClick={() => handleFeedback(camp._id)}
                                            onClick={()=>document.getElementById('feedback_modal').showModal()}
                                        >
                                            Give Feedback
                                        </button>
                                    )}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <button
                                        className={` text-white py-1 px-2 rounded ${camp?.paymentStatus === 'Paid' ? 'bg-gray-300' : 'bg-red-500'}`}
                                        onClick={() => handleCancel(camp._id)}
                                        disabled={camp?.paymentStatus === 'Paid'}
                                    >
                                        Cancel
                                    </button>



                                    {/* Modal */}
                                    <dialog id="feedback_modal" className="modal">
  <div className="modal-box">
    <h2 className="text-center text-2xl font-bold">Give Feedback</h2>
    <form onSubmit={()=> handleFeedback(event, camp)}>
        <p className="font-bold ">Rating</p>
    <Rating style={{ maxWidth: 250 }} value={rating} onChange={setRating} />
    <label className="form-control">
  <div className="label">
    <span className="label-text">Description</span>
  </div>
  <textarea name="description" className="textarea textarea-bordered h-24" placeholder="Description"></textarea>
</label>
    <div className="modal-action">
        <button className="btn btn-primary">Submit</button>     
    </div>
    </form>
  </div>
</dialog>
{/* Modal Close  */}




                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

               

                {/* {showFeedbackForm && (
                    <FeedbackForm
                        campId={selectedCamp}
                        onClose={() => setShowFeedbackForm(false)}
                    />
                )} */}

        {selectedCamp && (
            <Payment camp={selectedCamp} onPaymentSuccess={handlePaymentSuccess} />
        )}

            </div>
            
        );
    };



    export default RegisteredCamps;