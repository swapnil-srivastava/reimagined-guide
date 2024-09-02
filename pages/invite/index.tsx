'use client';

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage } from "react-intl";
import Image from "next/image";

import { supaClient } from "../../supa-client";

import { RootState } from "../../lib/interfaces/interface";
import { fetchInviteEvents } from "../../redux/actions/actions";

// CSS
import styles from "../../styles/Admin.module.css";

function Invite() {
  const dispatch = useDispatch();
  
  const selectInviteEvents = (state: RootState) => state.inviteEventsReducer;
  const { inviteEvents } = useSelector(selectInviteEvents);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const { data: eventsData, error } = await supaClient
          .from('events')
          .select('*');
  
        if (error) throw error;
  
        if (eventsData && eventsData.length > 0) {
          dispatch(fetchInviteEvents(eventsData));
          toast.success(`Retrieved Events`);
        } else {
          toast.success(`No events data returned from Supabase`);
        }
      } catch (error) {
        toast.error(`Error fetching events: ${error}`)
      }
    };

    fetchEventDetails();
  }, [dispatch]);

  return (
      <>
        <div className="flex justify-start w-full lg:px-12 px-10 pb-3 mt-7 font-poppins dark:text-blog-white lg:text-2xl text-lg">
            <FormattedMessage
                id="invite-page-event-heading"
                description="Event Details" // Description should be a string literal
                defaultMessage="Event Details" // Message should be a string literal
            />
        </div>
      {/* Event Section */}
      {
        <div className="flex h-full w-full lg:px-10 px-5 font-poppins">
          <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
              <div className="flex flex-col w-full h-full gap-2 justify-center items-center">
                  {/* Event Row */}
                  {inviteEvents && inviteEvents.map((inviteEvent, index, array) => (
                      <div key={inviteEvent.id} className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl">
                          <div className="flex lg:flex-row flex-col gap-2 h-full w-full">
                              <div className="flex flex-col ">
                                  <div className="self-center">
                                    <Image 
                                      src={inviteEvent.image_url ?? `/mountains.jpg`} 
                                      alt={inviteEvent.title}
                                      width={250}
                                      height={250}
                                      className="rounded-lg"
                                    />
                                  </div>
                              </div>
                              <div className="flex lg:flex-row flex-col w-full gap-4 justify-between">
                                  <div className="flex flex-col justify-between">
                                      {/* title and description section */}
                                      <div className="flex flex-col">
                                          <div className="lg:text-xl text-lg">{inviteEvent.title}</div>
                                          <div className="lg:text-xl text-xs">{inviteEvent.description}</div>                                         
                                      </div>
                                      {/* address section */}
                                      <div>
                                        <div className="lg:text-xl text-base event-address-text ">{inviteEvent.location}</div> 
                                      </div>
                                  </div>
                                  {/* time section */}
                                  {/* time and date shown in large screen */}
                                  <div className="flex lg:flex-col justify-between items-center">
                                      <div>
                                        <div className="lg:text-2xl text-xl">{inviteEvent.date}</div>
                                      </div>
                                      <div>
                                        <div className="lg:text-8xl text-2xl">{inviteEvent.time}</div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        </div>
      }

      {/* Invited  */}
      <div className="flex justify-start w-full lg:px-12 px-10 pb-3 font-poppins dark:text-blog-white lg:text-2xl text-lg">
          <FormattedMessage
              id="invite-page-invite-heading"
              description="Invitee List" // Description should be a string literal
              defaultMessage="Invitee List" // Message should be a string literal
          />
      </div>
      {/* Invite Section */}
      {
        <div className="flex h-full w-full lg:px-10 px-5 font-poppins">
          <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
              <div className="flex flex-col w-full h-full gap-2 justify-center items-center">
                  {/* Invited Family Row */}
                  <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                    <div className="flex flex-col items-center gap-2 justify-center h-full w-full">
                          <div className="text-center">
                              <FormattedMessage
                                  id="invite-page-invite-text"
                                  description="Functionality comming soon" // Description should be a string literal
                                  defaultMessage="Functionality coming soon" // Message should be a string literal
                              />
                          </div>
                    </div>
                  </div>
              </div>
          </div>
        </div>
      }
      </>
  );

}

export default Invite;
