import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const thawedBatches = await prisma.thawedBatch.findMany({
      include: {
        purchase_batch: {
          include: {
            product: true
          }
        }
      },
      orderBy: { thaw_date: 'desc' }
    })
    return NextResponse.json(thawedBatches)
  } catch (error) {
    console.error('Error fetching thawed batches:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch thawed batches',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Creating thawed batch with data:', body)
    
    // Get the purchase batch and product info
    const purchaseBatch = await prisma.purchaseBatch.findUnique({
      where: { id: body.purchase_batch_id },
      include: { product: true }
    })
    
    if (!purchaseBatch) {
      return NextResponse.json({ error: 'Purchase batch not found' }, { status: 404 })
    }
    
    // Calculate expiry date
    const thawDate = new Date()
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + purchaseBatch.product.shelf_life_thawed)
    
    const portionsToThaw = parseInt(body.portions_thawed)
    
    // Create thawed batch
    const thawedBatch = await prisma.thawedBatch.create({
      data: {
        purchase_batch_id: body.purchase_batch_id,
        thaw_date: thawDate,
        portions_thawed: portionsToThaw,
        expiry_date: expiryDate,
        status: 'active',
        remaining_portions: portionsToThaw
      },
      include: {
        purchase_batch: {
          include: {
            product: true
          }
        }
      }
    })
    
    // Update the original purchase batch
    await prisma.purchaseBatch.update({
      where: { id: body.purchase_batch_id },
      data: {
        remaining_portions: {
          decrement: portionsToThaw
        }
      }
    })
    
    console.log('Thawed batch created successfully:', thawedBatch)
    return NextResponse.json(thawedBatch)
  } catch (error) {
    console.error('Error creating thawed batch:', error)
    return NextResponse.json({ 
      error: 'Failed to create thawed batch',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}