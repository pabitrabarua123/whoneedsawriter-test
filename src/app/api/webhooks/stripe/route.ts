import { stripeClient } from "@/libs/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { prismaClient } from "@/prisma/db";

export async function POST(req: NextRequest): Promise<Response> {
  const headersList = headers();
  const stripeSignature = headersList.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  if (!stripeSignature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing Webhook secret." },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // Get the raw body for signature verification
    const body = await req.text();
    event = stripeClient.webhooks.constructEvent(
      body,
      stripeSignature,
      webhookSecret
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  // Handle Stripe events
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      break;

    case "checkout.session.completed":
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      let customer_email = checkoutSession.customer_email;
      
      const user1 = await prismaClient.user.findFirst({
        where: {
          email: customer_email as string,
        },
      });

      if (!user1) {
        return NextResponse.json({ error: "User not found" }, { status: 400 });
      }

      // handle stripe subscription
      if(checkoutSession.mode == 'subscription') {
        const subscription = await stripeClient.subscriptions.retrieve(checkoutSession.subscription as string);
      
        const stripeProductId = subscription.items.data[0].price.product as string;

      const subscriptionPlan = await prismaClient.subscriptionPlan.findFirst({
        where: {
          productId: stripeProductId,
        },
      });

      if (!subscriptionPlan) {
        console.error(
          "Event: customer.subscription.created — Subscription plan not found",
          JSON.stringify(event, null, 2)
        );
        return NextResponse.json(
          { error: "Subscription plan not found" },
          {
            status: 400,
          }
        );
      }
      
      var monthyBalance:number = 0;
      var monthyPlan:number = 0;

switch (stripeProductId) {
  case 'prod_SNpzHYxK73pcMz':
    monthyBalance = 20;
    monthyPlan = 20;
    break;

  case 'prod_SNpyVYxA6fTEE7':
    monthyBalance = 60;
    monthyPlan = 60;
    break;

  case 'prod_SNpyaI8RYkPnd9':
    monthyBalance = 200;
    monthyPlan = 200;
    break;

  case 'prod_SZigsQFIGhkCr0':
    monthyBalance = 20;
    monthyPlan = 20;
    break;

  case 'prod_SZihMgQLGeNXb4':
    monthyBalance = 60;
    monthyPlan = 60;
    break;

  case 'prod_SZiiSgAIWqKLAJ':
    monthyBalance = 200;
    monthyPlan = 200;
    break;  
}

      await prismaClient.userPlan.upsert({
        where: {
          userId: user1?.id,
        },
        update: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          validUntil: new Date(subscription.current_period_end * 1000),
        },
        create: {
          userId: user1?.id,
          planId: subscriptionPlan?.id,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          validUntil: new Date(subscription.current_period_end * 1000),
        },
      });

      await prismaClient.user.update({
        where: {
          id: user1?.id,
        },
        data: {
          monthyBalance: monthyBalance,
          monthyPlan: monthyPlan,
        }
      });
      }

     // handle lifetime stripe payment
    if(checkoutSession.mode == 'payment') {
              
      let amount_total_real = (checkoutSession.amount_total ?? 0) / 100;
      var lifetimeBalance:number = 0;
      var lifetimePlan:number = 0;
      switch (amount_total_real) {
        case 45:
          lifetimeBalance = 30;
          lifetimePlan = 30;
          break;
          
        case 120:
          lifetimeBalance = 75;
          lifetimePlan = 75;
          break;
        
        case 300:
          lifetimeBalance = 250;
          lifetimePlan = 250;
          break;

        case 3700:
          lifetimeBalance = 30;
          lifetimePlan = 30;
          break;
            
        case 10000:
          lifetimeBalance = 75;
          lifetimePlan = 75;
          break;
          
        case 25000:
          lifetimeBalance = 250;
          lifetimePlan = 250;
          break;
      }

        await prismaClient.user.update({
          where: {
            id: user1?.id,
          },
          data: {
            lifetimeBalance: lifetimeBalance,
            lifetimePlan: lifetimePlan,
          }
        });
      }

      break;

    case "payment_intent.payment_failed":
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
      break;

    case "customer.subscription.updated":
      const subscription = event.data.object as Stripe.Subscription;

      // get the customer email using the customer id
      const customer = await stripeClient.customers.retrieve(
        subscription.customer as string
      );

      if (!customer || customer.deleted) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 400 }
        );
      }

      const user = await prismaClient.user.findFirst({
        where: {
          email: customer.email as string,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 400 });
      }

      break;

    case "invoice.paid":
      const invoice = event.data.object as Stripe.Invoice;

      const _subscription = await stripeClient.subscriptions.retrieve(
        invoice.subscription as string
      );
      const userPlan = await prismaClient.userPlan.findFirst({
        where: {
          stripeSubscriptionId: _subscription.id,
        },
      });

      if (!userPlan) {
        console.error(
          "Event: invoice.paid — User plan not found",
          JSON.stringify(event, null, 2)
        );
        return NextResponse.json("User plan not found", { status: 400 });
      }

      // Get the user to update their balances
      const renewalUser = await prismaClient.user.findUnique({
        where: {
          id: userPlan.userId,
        },
      });

      if (!renewalUser) {
        console.error(
          "Event: invoice.paid — User not found",
          JSON.stringify(event, null, 2)
        );
        return NextResponse.json("User not found", { status: 400 });
      }

      // Refresh monthly balances based on the subscription plan
      const stripeProductId = _subscription.items.data[0].price.product as string;
      var monthyBalance: number = 0;
      var monthyPlan: number = 0;

      switch (stripeProductId) {
        case 'prod_SNpzHYxK73pcMz':
          monthyBalance = 20;
          monthyPlan = 20;
          break;

        case 'prod_SNpyVYxA6fTEE7':
          monthyBalance = 60;
          monthyPlan = 60;
          break;

        case 'prod_SNpyaI8RYkPnd9':
          monthyBalance = 200;
          monthyPlan = 200;
          break;

        case 'prod_SZigsQFIGhkCr0':
          monthyBalance = 20;
          monthyPlan = 20;
          break;
          
        case 'prod_SZihMgQLGeNXb4':
          monthyBalance = 60;
          monthyPlan = 60;
          break;
          
          
        case 'prod_SZiiSgAIWqKLAJ':
          monthyBalance = 200;
          monthyPlan = 200;
          break;
      }

      await prismaClient.userPlan.update({
        where: {
          userId: renewalUser.id,
        },
        data: {
          validUntil: new Date(_subscription.current_period_end * 1000),
        },
      });

      // Update user's monthly balances for the renewal
      await prismaClient.user.update({
        where: {
          id: renewalUser.id,
        },
        data: {
          monthyBalance: monthyBalance,
          monthyPlan: monthyPlan,
        }
      });

      break;

    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object as Stripe.Subscription;

      // Find the user plan associated with this subscription
      const deletedUserPlan = await prismaClient.userPlan.findFirst({
        where: {
          stripeSubscriptionId: deletedSubscription.id,
        },
      });

      if (!deletedUserPlan) {
        console.error(
          "Event: customer.subscription.deleted — User plan not found",
          JSON.stringify(event, null, 2)
        );
        return NextResponse.json("User plan not found", { status: 400 });
      }

      // Get the user to update their subscription status
      const cancelledUser = await prismaClient.user.findUnique({
        where: {
          id: deletedUserPlan.userId,
        },
      });

      if (!cancelledUser) {
        console.error(
          "Event: customer.subscription.deleted — User not found",
          JSON.stringify(event, null, 2)
        );
        return NextResponse.json("User not found", { status: 400 });
      }

      // Update user plan to reflect cancellation
      await prismaClient.userPlan.update({
        where: {
          id: deletedUserPlan.id,
        },
        data: {
          cancelled: 1,
        },
      });

      break;

    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
